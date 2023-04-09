package io.highlight.sdk.common;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class HighlightVersion {

	private static final String SDK_NAME;
	private static final String SDK_VERSION;
	private static final String SDK_LANGUAGE;

	private static final String JAVA_VENDOR;
	private static final String JAVA_VERSION;
	private static final String JAVA_VERSION_DATE;

	private static final String OS_NAME;
	private static final String OS_VERSION;
	private static final String OS_ARCH;

	static {
		Properties properties = new Properties();

		try (InputStream inputStream = HighlightVersion.class.getClassLoader().getResourceAsStream("manifest.properties")) {
			properties.load(inputStream);
		} catch (IOException e) {
			e.printStackTrace();
		}

		SDK_NAME = properties.getProperty("name", "unknown");
		SDK_VERSION = properties.getProperty("version", "unknown");
		SDK_LANGUAGE = properties.getProperty("language", "unknown");

		JAVA_VENDOR = System.getProperty("java.vendor", "unknown");
		JAVA_VERSION = System.getProperty("java.version", "unknown");
		JAVA_VERSION_DATE = System.getProperty("java.version.date", "unknown");

		OS_NAME = System.getProperty("os.name", "unknown");
		OS_VERSION = System.getProperty("os.version", "unknown");
		OS_ARCH = System.getProperty("os.arch", "unknown");
	}

	public static String getSdkName() {
		return SDK_NAME;
	}

	public static String getSdkVersion() {
		return SDK_VERSION;
	}

	public static String getSdkLanguage() {
		return SDK_LANGUAGE;
	}

	public static String getJavaVendor() {
		return JAVA_VENDOR;
	}

	public static String getJavaVersion() {
		return JAVA_VERSION;
	}

	public static String getJavaVersionDate() {
		return JAVA_VERSION_DATE;
	}

	public static String getOsName() {
		return OS_NAME;
	}

	public static String getOsVersion() {
		return OS_VERSION;
	}

	public static String getOsArch() {
		return OS_ARCH;
	}
}
