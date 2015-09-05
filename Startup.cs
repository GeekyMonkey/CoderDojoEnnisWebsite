using Microsoft.AspNet.Builder;
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
            
            app.UseErrorPage();

            app.UseStaticFiles();

            // app.UseMvcWithDefaultRoute();

            app.UseWelcomePage();
        }
    }
}