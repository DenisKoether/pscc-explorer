import type { MeasureItem, Measure, AstTopLayer, Site, MeasureGroup } from '@samply/lens';

//import { buildLibrary, buildMeasure } from './cql-measure';
import { translateAstToCql } from './ast-to-cql-translator';
import { Blaze } from './blaze';

export const requestBackend = (
	ast: AstTopLayer,
	updateResponse: (response: Map<string, Site>) => void,
	abortController: AbortController,
	measureGroups: MeasureGroup[],
	criteria: string[]
) => {
	const measures: Measure[] = measureGroups[0].measures.map(
		(measureItem: MeasureItem) => measureItem.measure
	);

	// let query = {};

	const cql = translateAstToCql(
		ast,
		false,
		'define InInitialPopulation:',
		measureGroups[0].measures,
		criteria
	);

	/* 	const library = buildLibrary(`${cql}`);
	const measure = buildMeasure(library.url, measures);
	query = { lang: 'cql', lib: library, measure: measure }; */

	let backendUrl: string = '';

	backendUrl = 'http://localhost:8082/fhir';

	const backend = new Blaze(new URL(backendUrl), 'DKTK', '');

	backend.send(cql, updateResponse, abortController, measures);
};
