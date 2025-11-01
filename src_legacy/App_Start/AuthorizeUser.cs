using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace CoderDojo
{
    public class AuthorizeUser : AuthorizeAttribute
    {
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            if (!filterContext.HttpContext.User.Identity.IsAuthenticated)
            {
                //filterContext.Result = new RedirectToRouteResult(
                //    new RouteValueDictionary(new { controller = "Home", action = "Login" }));

                ViewResult result = new ViewResult {
                    ViewName = "Redirect",
                };
                result.ViewData.Model = "/Home/Login";
                filterContext.Result = result;
            }
        }

    }
}