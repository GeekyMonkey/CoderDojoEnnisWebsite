using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace CoderDojo
{
    public static class SecurityExtensions
    {
        static char[] cookieDelimeter = new char[] { '|' };

        public static UserRoles GetUserRole(this System.Security.Principal.IIdentity identity)
        {
            string roleString = identity.Name.Split(cookieDelimeter)[0];
            return (UserRoles)Enum.Parse(typeof(UserRoles), roleString);
        }

        public static Guid GetUserId(this System.Security.Principal.IIdentity identity)
        {
            string idString = identity.Name.Split(cookieDelimeter)[1];
            return new Guid(idString);
        }
    }
}