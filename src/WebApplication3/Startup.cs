﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Builder;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.StaticFiles;
using Microsoft.Framework.DependencyInjection;
using Microsoft.AspNet.Diagnostics;

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
            var fileServerOptions = new FileServerOptions
            {
                EnableDefaultFiles = true, 
                EnableDirectoryBrowsing = false
            };
            FileExtensionContentTypeProvider contentTypeProvider = (FileExtensionContentTypeProvider)fileServerOptions.StaticFileOptions.ContentTypeProvider;
            contentTypeProvider.Mappings.Add(".svg", "image/svg+xml");
            app.UseFileServer(fileServerOptions);

            app.UseErrorPage();

            // ToDo: Only route to this from /index.php/calendar/
            app.UseStatusCodePagesWithRedirects("/#/WhenWhereModal");

            //            app.UseStatusCodePages();

            // StaticFileOptions option = new StaticFileOptions();
            // FileExtensionContentTypeProvider contentTypeProvider = (FileExtensionContentTypeProvider)option.ContentTypeProvider;
            //contentTypeProvider.Mappings.Add("<<yourextention>>", "<<mimetype>>");
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
