using Microsoft.AspNet.Builder;
using Microsoft.AspNet.StaticFiles;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.Logging;

namespace CoderDojoEnnis
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // services.AddMvc();
        }

        public void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole();

            app.UseStatusCodePages();

            app.UseErrorPage();

            app.UseRuntimeInfoPage("/info");

            var staticFileOptions = new StaticFileOptions();
            app.UseStaticFiles(staticFileOptions);

            // app.UseMvcWithDefaultRoute();

            app.UseWelcomePage("/welcome");
        }
    }
}