import type { ResponseStore } from '@samply/lens';
import type { Site } from '@samply/lens';
//import type { MeasureStore } from "@samply/lens";
//import { buildLibrary, buildMeasure } from "@samply/lens";

import { v4 as uuidv4 } from 'uuid';
import type { Measure } from '@samply/lens';

type BuildLibraryReturn = {
	resourceType: string;
	url: string;
	status: string;
	type: {
		coding: {
			system: string;
			code: string;
		}[];
	};
	content: {
		contentType: string;
		data: string;
	}[];
};

export const buildLibrary = (cql: string): BuildLibraryReturn => {
	const libraryId = uuidv4();
	const encodedQuery = btoa(unescape(encodeURIComponent(cql)));
	return {
		resourceType: 'Library',
		url: 'urn:uuid:' + libraryId,
		status: 'active',
		type: {
			coding: [
				{
					system: 'http://terminology.hl7.org/CodeSystem/library-type',
					code: 'logic-library'
				}
			]
		},
		content: [
			{
				contentType: 'text/cql',
				data: encodedQuery
			}
		]
	};
};

type BuildMeasureReturn = {
	resourceType: string;
	url: string;
	status: string;
	subjectCodeableConcept: {
		coding: {
			system: string;
			code: string;
		}[];
	};
	library: string;
	scoring: {
		coding: {
			system: string;
			code: string;
		}[];
	};
	group: Measure[];
};

export const buildMeasure = (
	libraryUrl: string,
	measures: Measure[]
): BuildMeasureReturn => {
	const measureId = uuidv4();
	return {
		resourceType: 'Measure',
		url: 'urn:uuid:' + measureId,
		status: 'active',
		subjectCodeableConcept: {
			coding: [
				{
					system: 'http://hl7.org/fhir/resource-types',
					code: 'Patient'
				}
			]
		},
		library: libraryUrl,
		scoring: {
			coding: [
				{
					system: 'http://terminology.hl7.org/CodeSystem/measure-scoring',
					code: 'cohort'
				}
			]
		},
		group: measures // configuration.resultRequests.map(request => request.measures)
	};
};

export class Blaze {
	constructor(
		private url: URL,
		private name: string,
		private auth: string = ''
	) {}

	/**
	 * sends the query to beam and updates the store with the results
	 * @param cql the query as cql string
	 * @param controller the abort controller to cancel the request
	 */
	async send(
		cql: string,
		updateResponse: (response: ResponseStore) => void,
		controller?: AbortController,
		measureDefinitions: Measure[]
	): Promise<void> {
		try {
			updateResponse(
				new Map().set('DKTK', {
					status: 'claimed',
					data: null
				})
			);
			const libraryResponse = await fetch(new URL(`${this.url}/Library`), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(buildLibrary(cql)),
				signal: controller?.signal
			});
			if (!libraryResponse.ok) {
				this.handleError(`Couldn't create Library in Blaze`, libraryResponse);
			}
			const library = await libraryResponse.json();
			const measureResponse = await fetch(new URL(`${this.url}/Measure`), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(buildMeasure(library.url, measureDefinitions)),
				signal: controller.signal
			});
			if (!measureResponse.ok) {
				this.handleError(`Couldn't create Measure in Blaze`, measureResponse);
			}
			const measure = await measureResponse.json();
			const dataResponse = await fetch(
				new URL(
					`${this.url}/Measure/$evaluate-measure?measure=${measure.url}&periodStart=2000&periodEnd=2030`
				),
				{
					signal: controller.signal
				}
			);
			if (!dataResponse.ok) {
				this.handleError(`Couldn't evaluate Measure in Blaze`, dataResponse);
			}
			const blazeResponse: Site = await dataResponse.json();
			updateResponse(
				new Map().set('DKTK', {
					status: 'succeeded',
					data: blazeResponse
				})
			);
		} catch (err) {
			if (err.name === 'AbortError') {
				console.log(`Aborting former blaze request.`);
			} else {
				console.error(err);
			}
		}
	}

	async handleError(message: string, response: Response): Promise<void> {
		const errorMessage = await response.text();
		console.debug(
			`${message}. Received error ${response.status} with message ${errorMessage}`
		);
	}
}
