package hello;

import org.joda.time.LocalTime;
import io.highlight.sdk.Highlight;
import io.sentry.Sentry;

public class HelloWorld {
  public static void main(String[] args) {
    LocalTime currentTime = new LocalTime();
    System.out.println("The current local time is: " + currentTime);
    Greeter greeter = new Greeter();


    HighlightOptions options = HighlightOptions.builder("PROJECT_ID")
	    .version("1.0.0")
	    .environment("development")
	  .build();

    Highlight.init(options);


    System.out.println(greeter.sayHello());
  }
}