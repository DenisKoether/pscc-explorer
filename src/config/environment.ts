// VITE_TARGET_ENVIRONMENT should be set by the ci pipeline

import type { MeasureGroup, MeasureItem } from '@samply/lens';

import { patientsMeasure, testMeasure } from '../measures';

export const genderHeaders: Map<string, string> = new Map<string, string>()
	.set('male', 'männlich')
	.set('female', 'weiblich')
	.set('other', 'Divers, Intersexuell')
	.set('unknown', 'unbekannt');

export const barChartBackgroundColors: string[] = ['#4dc9f6', '#3da4c7'];

/**
 * Array of measure groups for different backends
 */
export const measures: MeasureGroup[] = [
	{
		name: 'DKTK',
		measures: [patientsMeasure as MeasureItem, testMeasure as MeasureItem]
	}
];

export const backendMeasures = `define InInitialPopulation:\n`;
