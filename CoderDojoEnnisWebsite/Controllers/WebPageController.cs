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

        [Route(".well-known/brave-rewards-verification.txt")]
        public IActionResult BraveRewards()
        {
            return Content(@"This is a Brave Rewards publisher verification file.

Domain: coderdojoennis.com
Token: 51d24e9455ed94d33d2c6a4ec3fd146b95978b90bef2cd8c2d4e223545eb692c
", 
            "text/plain" );
        }
    }
}