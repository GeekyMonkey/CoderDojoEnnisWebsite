using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace CoderDojo
{
    /// <summary>
    /// Check if the logged in user is a parent
    /// </summary>
    public class AuthorizeParent : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            bool allowed = false;
            try
            {
                allowed = httpContext.User.Identity.GetUserRole() == UserRoles.Parent;
                if (!allowed)
                {
                    CoderDojoData db = new CoderDojoData();
                    Guid userId = httpContext.User.Identity.GetUserId();
                    Adult adult = db.Adults.FirstOrDefault(a => a.Id == userId);
                    if (adult != null)
                    {
                        allowed = (adult.IsParent);
                    }
                }
            }
            catch { }

            return allowed;
        }

    }
}