using System.Diagnostics;
using dotnet;
using dotnet.Components;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

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
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

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

app.MapGet("/api/traces",
    () => {
        Log.Warning("stormy weather ahead");
        using var span = tracer.StartActivity("SomeWork")!;
        span.SetTag("mystring", "value");
        span.SetTag("myint", 100);
        span.SetTag("mydouble", 101.089);
        span.SetTag("mybool", true);

        var childSpan = tracer.StartActivity("child span")!;
        Log.Information("clear skies now");
        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast(
                DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                Random.Shared.Next(-20, 55),
                summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();

        childSpan.SetTag("forecast", forecast[0].Summary);
        childSpan.SetStatus(ActivityStatusCode.Ok);
        childSpan.Stop();

        Trace.TraceWarning("forecast incoming");
        return forecast;
    })
    .WithName("GetTraces");

app.MapGet("/api/logs",
    () => {
        Log.Warning("just a warning log");
        Log.Information("info log here");
        return "hello";
    })
    .WithName("GetLogs");


app.MapGet("/api/errors",
    () => {
        Log.Warning("going to throw an exception");

        using var span = tracer.StartActivity("ShouldThrow")!;
        throw new Exception("oh no, a random error occurred " + Guid.NewGuid());
    })
    .WithName("GetErrors");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

