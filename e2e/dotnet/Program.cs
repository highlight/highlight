using System.Diagnostics;
using dotnet;
using OpenTelemetry.Trace;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

Log.Logger = new LoggerConfiguration()
    .Enrich.WithMachineName()
    .Enrich.With<HighlightLogEnricher>()
    .Enrich.FromLogContext()
    .WriteTo.Async(async =>
        async.OpenTelemetry(options =>
        {
            options.Endpoint = HighlightConfig.LogsEndpoint;
            options.Protocol = HighlightConfig.Protocol;
            options.ResourceAttributes = HighlightConfig.ResourceAttributes;
        })
    )
    .CreateLogger();

HighlightConfig.Configure(builder);
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

var tracer = new ActivitySource(HighlightConfig.ServiceName);
var activityListener = new ActivityListener
{
    ShouldListenTo = s => true,
    SampleUsingParentId = (ref ActivityCreationOptions<string> activityOptions) => ActivitySamplingResult.AllData,
    Sample = (ref ActivityCreationOptions<ActivityContext> activityOptions) => ActivitySamplingResult.AllData
};
ActivitySource.AddActivityListener(activityListener);

app.MapGet("/weatherforecast", () =>
    {
        Log.Warning("stormy weather ahead");
        using var span = tracer.StartActivity("SomeWork")!;
        span.SetTag("mystring", "value");
        span.SetTag("myint", 100);
        span.SetTag("mydouble", 101.089);
        span.SetTag("mybool", true);

        var childSpan = tracer.StartActivity("child span")!;
        Log.Information("clear skies now");
        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();

        childSpan.SetTag("forecast", forecast[0].Summary);
        childSpan.SetStatus(Status.Ok);
        childSpan.Stop();
        
        Trace.TraceWarning("forecast incoming");
        return forecast;
    })
    .WithName("GetWeatherForecast")
    .WithOpenApi();


app.MapGet("/error", () =>
    {
        Log.Warning("going to throw an exception");
        
        using var span = tracer.StartActivity("ShouldThrow")!;
        throw new Exception("oh no, a random error occurred " + Guid.NewGuid());
    })
    .WithName("GetError")
    .WithOpenApi();

app.MapGet("/", () => "Hello World!")
    .WithName("GetRoot")
    .WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
