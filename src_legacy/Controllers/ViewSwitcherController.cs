using System.Web.Mvc;
using System.Web.WebPages;

namespace CoderDojo.Controllers
{
    [OutputCacheAttribute(VaryByParam = "*", Duration = 0, NoStore = true)]
    public class ViewSwitcherController : Controller
    {
        public RedirectResult SwitchView(bool mobile, string returnUrl)
        {
            if (Request.Browser.IsMobileDevice == mobile)
            {
                HttpContext.ClearOverriddenBrowser();
            }
            else
            {
                HttpContext.SetOverriddenBrowser(mobile ? BrowserOverride.Mobile : BrowserOverride.Desktop);
            }
            return Redirect(returnUrl);
        }
    }
}
