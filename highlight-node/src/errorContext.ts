import LRU from 'lru-cache';
import fs from 'fs';

interface StackFrameContext {
    lineContent: string | undefined;
    linesBefore: string | undefined;
    linesAfter: string | undefined;
}

const CONTEXT_LINE_MAX_SIZE = 1000;
const CONTEXT_LINES_COUNT = 5;

interface ErrorContextOptions {
    sourceContextCacheSizeMB?: number; // Interpreted as unbounded if <= 0, otherwise size in MB. Default 10MB.
}

function coalesceSize(inputSize: number | undefined): number | undefined {
    if (inputSize === undefined) {
        return CONTEXT_CACHE_DEFAULT_SIZE;
    } else if (inputSize <= 0) {
        return undefined;
    } else {
        return inputSize;
    }
}

const CONTEXT_CACHE_DEFAULT_SIZE = 10;

interface FileLines {
    lines: Map<number, string>;
    size: number;
}

export class ErrorContext {
    _sourceContextCacheSizeMB: number | undefined;
    _cache: LRU<string, FileLines>;

    constructor(options: ErrorContextOptions) {
        this._sourceContextCacheSizeMB = coalesceSize(options.sourceContextCacheSizeMB);

        const lruOptions = {
            max: 1000,
            maxSize: this._sourceContextCacheSizeMB 
                ? this._sourceContextCacheSizeMB * 1000 * 1000 
                : undefined,
            length: (lines: FileLines, key: string): number => {
                return lines.size;
            },
        };

        this._cache = new LRU(lruOptions);          
    }

    _getOrLoadLines(filename: string): Map<number, string> {
        const maybeCached = this._cache.get(filename);
        if (maybeCached !== undefined) {
            return maybeCached.lines;
        }

        let lineIdx = 1;
        let size = 0;
        const contents = fs.readFileSync(filename, 'utf8');
        const lineStrs = contents.split('\n');
        const lines = new Map<number, string>();
        lineStrs.forEach((line, idx) => {
            lines.set(idx + 1, line + '\n');
        });

        this._cache.set(filename, {
            lines,
            size,
        });

        return lines;
    }

    getStackFrameContext(filename: string, lineNumber: number): StackFrameContext {
        const lines = this._getOrLoadLines(filename);

        let lineContent = lines.get(lineNumber);

        let linesBefore = '';
        for (let i = lineNumber - CONTEXT_LINES_COUNT; i < lineNumber; i++) {
            let nextLine = lines.get(i);
            if (nextLine !== undefined) {
                linesBefore += nextLine;
            }
        }

        let linesAfter = '';
        for (let i = lineNumber + 1; i < lineNumber + CONTEXT_LINES_COUNT + 1; i++) {
            let nextLine = lines.get(i);
            if (nextLine !== undefined) {
                linesAfter += nextLine;
            }
        }

        return {
            lineContent,
            linesBefore,
            linesAfter,
        }
    }
}
