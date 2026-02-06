import { sed } from 'sed-lite';

const SLASH_COUNT_REGEX = /(?<!\\)\//g;

export function applySedTransform(sedText: string, targetText: string): string {
	const matches = sedText.match(SLASH_COUNT_REGEX);
	const slashCount = matches ? matches.length : 0;
	const validSedText = slashCount > 2 ? sedText : sedText + '/';
	const sedTransform = sed(validSedText);
	return sedTransform(targetText);
}
