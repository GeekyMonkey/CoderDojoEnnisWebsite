using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace CoderDojo
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "SignIn",
                url: "SignIn",
                defaults: new { controller = "Home", action = "SignIn", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "SignInQR",
                url: "SignInQR",
                defaults: new { controller = "Home", action = "SignInQR", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "SessionPodLogin",
                url: "SessionPodLogin",
                defaults: new { controller = "Home", action = "SessionPodLogin", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Passport",
                url: "Passport/{id}",
                defaults: new { controller = "Home", action = "Passport", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Passports",
                url: "Passports",
                defaults: new { controller = "Home", action = "Passports", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "PassportMentor",
                url: "PassportMentor/{id}",
                defaults: new { controller = "Home", action = "PassportMentor", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "BeltCertificate",
                url: "BeltCertificate/{id}",
                defaults: new { controller = "Home", action = "BeltCertificate", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );

        }
    }
}