package io.highlight.sdk.common;

import java.io.IOException;

import java.io.InputStream;
import java.util.Properties;

/**
 * The HighlightVersion class provides static methods to retrieve information
 * about the current version of the Highlight SDK, the Java environment, and the
 * operating system on which the SDK is running. <br>
 * <br>
 * Note: This class reads the version information from a manifest file named
 * "manifest.properties" located in the classpath. <br>
 * If the file is not found, the SDK name and version default to "unknown".
 */
public class HighlightVersion {

	// SDK version information
	private static final String SDK_NAME;
	private static final String SDK_VERSION;
	private static final String SDK_LANGUAGE;

	// Java version information
	private static final String JAVA_VENDOR;
	private static final String JAVA_VERSION;
	private static final String JAVA_VERSION_DATE;

	// OS version information
	private static final String OS_NAME;
	private static final String OS_VERSION;
	private static final String OS_ARCH;

	/**
	 * Initializes the class's static fields with the relevant information about the
	 * SDK, Java environment, and operating system.
	 */
	static {
		Properties properties = new Properties();

		try (InputStream inputStream = HighlightVersion.class.getClassLoader()
				.getResourceAsStream("manifest.properties")) {
			properties.load(inputStream);
		} catch (IOException e) {
			throw new RuntimeException("Highlight failed to load manifest properties", e);
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

	/**
	 * Returns the name of the Highlight SDK.
	 *
	 * @return the name of the SDK
	 */
	public static String getSdkName() {
		return SDK_NAME;
	}

	/**
	 * Returns the version of the Highlight SDK.
	 *
	 * @return the version of the SDK
	 */
	public static String getSdkVersion() {
		return SDK_VERSION;
	}

	/**
	 * Returns the programming language used to implement the Highlight SDK.
	 *
	 * @return the programming language of the SDK
	 */
	public static String getSdkLanguage() {
		return SDK_LANGUAGE;
	}

	/**
	 * Returns the vendor of the Java Virtual Machine (JVM) running the Highlight
	 * SDK.
	 *
	 * @return the vendor of the JVM
	 */
	public static String getJavaVendor() {
		return JAVA_VENDOR;
	}

	/**
	 * Returns the version of the Java Runtime Environment (JRE) running the
	 * Highlight SDK.
	 *
	 * @return the version of the JRE
	 */
	public static String getJavaVersion() {
		return JAVA_VERSION;
	}

	/**
	 * Returns the Java version date.
	 *
	 * @return The Java version date.
	 */
	public static String getJavaVersionDate() {
		return JAVA_VERSION_DATE;
	}

	/**
	 * Returns the operating system name.
	 *
	 * @return The operating system name.
	 */
	public static String getOsName() {
		return OS_NAME;
	}

	/**
	 * Returns the operating system version.
	 *
	 * @return The operating system version.
	 */
	public static String getOsVersion() {
		return OS_VERSION;
	}

	/**
	 * Returns the operating system architecture.
	 *
	 * @return the operating system architecture.
	 */
	public static String getOsArch() {
		return OS_ARCH;
	}

	/**
	 * Non accessible constructor because this class just providing static fields
	 */
	private HighlightVersion() {
	}
}
