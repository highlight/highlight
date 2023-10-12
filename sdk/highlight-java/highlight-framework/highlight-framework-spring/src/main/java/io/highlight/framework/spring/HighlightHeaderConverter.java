package io.highlight.framework.spring;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import io.highlight.sdk.common.HighlightHeader;

@Component
public class HighlightHeaderConverter implements Converter<String, HighlightHeader> {

	@Override
	public HighlightHeader convert(String source) {
		return HighlightHeader.parse(source);
	}
}