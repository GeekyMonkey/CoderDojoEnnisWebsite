﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.StaticFiles;
using Microsoft.Framework.DependencyInjection;

namespace WebApplication3
{
    public class Startup
    {
        // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseFileServer(new FileServerOptions { EnableDefaultFiles = true, EnableDirectoryBrowsing = false });
            //app.UseStaticFiles(new StaticFileOptions { ServeUnknownFileTypes = false });
            // app.UseDefaultFiles();

            /*
            app.Run(async (context) =>
            {
                await context.Response.WriteAsync("Hello Coder Dojo!");
            });
            */
        }
    }
}
