import { describe, it, expect } from 'vitest';
import { applySedTransform } from '../src/sed-transform';

describe('applySedTransform', () => {
	describe('basic substitution', () => {
		it('replaces first occurrence of a word', () => {
			expect(applySedTransform('s/hello/world/', 'hello there')).toBe('world there');
		});

		it('replaces a substring within a sentence', () => {
			expect(applySedTransform('s/foo/bar/', 'I love foo')).toBe('I love bar');
		});

		it('returns the original text when pattern is not found', () => {
			expect(applySedTransform('s/xyz/abc/', 'hello world')).toBe('hello world');
		});
	});

	describe('global flag', () => {
		it('replaces all occurrences with the g flag', () => {
			expect(applySedTransform('s/a/b/g', 'aaa')).toBe('bbb');
		});

		it('replaces only first occurrence without the g flag', () => {
			expect(applySedTransform('s/a/b/', 'aaa')).toBe('baa');
		});
	});

	describe('case-insensitive flag', () => {
		it('matches case-insensitively with i flag', () => {
			expect(applySedTransform('s/hello/world/i', 'Hello there')).toBe('world there');
		});
	});

	describe('trailing slash auto-append', () => {
		it('works without trailing slash', () => {
			expect(applySedTransform('s/hello/world', 'hello there')).toBe('world there');
		});

		it('works with trailing slash already present', () => {
			expect(applySedTransform('s/hello/world/', 'hello there')).toBe('world there');
		});
	});

	describe('empty replacement', () => {
		it('removes the matched text when replacement is empty', () => {
			expect(applySedTransform('s/hello//', 'hello world')).toBe(' world');
		});

		it('removes the matched text without trailing slash', () => {
			expect(applySedTransform('s/hello/', 'hello world')).toBe(' world');
		});
	});

	describe('special characters', () => {
		it('handles regex special characters in replacement', () => {
			expect(applySedTransform('s/hello/world!/', 'hello there')).toBe('world! there');
		});
	});

	describe('escaped slashes', () => {
		it('handles escaped slashes in pattern', () => {
			expect(applySedTransform('s/a\\/b/c/', 'a/b')).toBe('c');
		});
	});

	describe('invalid sed expressions', () => {
		it('throws on malformed expressions', () => {
			expect(() => applySedTransform('not a sed command', 'hello')).toThrow();
		});
	});
});
