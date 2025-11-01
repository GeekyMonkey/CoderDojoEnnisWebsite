using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace CoderDojo
{
    /// <summary>
    /// Check if the logged in user is a mentor
    /// </summary>
    public class AuthorizeMentor : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            bool allowed = false;
            try
            {
                allowed = httpContext.User.Identity.GetUserRole() == UserRoles.Mentor;
            }
            catch { }

            return allowed;
        }

    }
}