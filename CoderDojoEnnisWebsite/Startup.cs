using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.Extensions.DependencyInjection;

namespace CoderDojoEnnisWebsite
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRouting();
            services.AddResponseCaching();
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
               app.UseDeveloperExceptionPage();
            }

            var rewriteOptions = new Microsoft.AspNetCore.Rewrite.RewriteOptions().AddRedirect("index.php/calendar.*", "/#/WhenWhereModal");
            app.UseRewriter(rewriteOptions);

            app.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = { "index.html" } });

            app.UseStaticFiles();

            app.UseMvc();

            app.UseResponseCaching();
        }
    }
}
