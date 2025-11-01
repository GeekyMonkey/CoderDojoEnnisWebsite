using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace CoderDojo
{
    /// <summary>
    /// Check if the logged in user is a mentor or parent
    /// </summary>
    public class AuthorizeAdult : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            bool allowed = false;
            try
            {
                UserRoles role = httpContext.User.Identity.GetUserRole();
                allowed = role == UserRoles.Mentor || role == UserRoles.Parent;
            }
            catch { }

            return allowed;
        }

    }
}