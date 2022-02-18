import { HighlightOptions } from 'highlight.run';

export interface NodeOptions extends HighlightOptions {
    disableSourceContext?: boolean;
    sourceContextCacheSizeMB?: number;
}
