using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace CoderDojoEnnisWebsite.Controllers
{
    public class WebPageController : Controller
    {
        [Route("foo")]
        public IActionResult Index()
        {
            return Content("boop");
        }

        [Route("covid")]
        public IActionResult Covid()
        {
            return Redirect("https://docs.google.com/document/d/1JW-hfn6n8Y41PlDMiAU3na-NagKuswkMjMcjARNnIbU");
        }

        [Route(".well-known/brave-rewards-verification.txt")]
        public IActionResult BraveRewards()
        {
            return Content(@"This is a Brave Rewards publisher verification file.

Domain: coderdojoennis.com
Token: 6bc16d4dbc7da5ed857e7893cc5b106c30de882c6af8180670b07c95d7619730
", 
            "text/plain" );
        }
    }
}