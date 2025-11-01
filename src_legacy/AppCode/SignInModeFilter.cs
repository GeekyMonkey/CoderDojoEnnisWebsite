using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CoderDojo
{
    public class SignInModeFilterAttribute : FilterAttribute, IAuthorizationFilter
    {
        public void OnAuthorization(System.Web.Mvc.AuthorizationContext filterContext)
        {
            bool haveValidCooke = false;
            var signInCookie = filterContext.RequestContext.HttpContext.Request.Cookies["SignInCookie"];
            if (signInCookie != null)
            {
                if (signInCookie.Value == DateTime.Today.ToString("dd-MMM-yyyy"))
                {
                    haveValidCooke = true;
                }
            }
            if (!haveValidCooke)
            {
                string currentUrl = filterContext.RequestContext.HttpContext.Request.Url.PathAndQuery;
                filterContext.Result = new RedirectResult("/Home/Login?ValidationMessage=Only mentors can initiate signin mode&ReturnUrl=" + currentUrl, false);
            }
        }
    }
}