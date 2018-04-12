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
    }
}