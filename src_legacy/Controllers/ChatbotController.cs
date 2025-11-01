using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Security.Cryptography;
using System.Web.Security;
using System.Web.WebPages;
using Microsoft.AspNet.SignalR;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.Storage;
using System.Configuration;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.Ajax.Utilities;

namespace CoderDojo.Controllers
{
    [OutputCacheAttribute(VaryByParam = "*", Duration = 0, NoStore = true)]
    public class ChatbotController : BaseController
    {
        [AllowAnonymous]
        public ActionResult Badges()
        {
            var badges = db.Badges
                .Include("BadgeCategory")
                .ToList()
                .Select(b => new
                {
                    ID = b.Id.ToString("N"),
                    Achievement = b.Achievement,
                    Description = b.Description,
                    CategoryName = b.BadgeCategory.CategoryName
                })
                .OrderBy(b => b.CategoryName)
                .ThenBy(b => b.Achievement);

            return Json(badges, JsonRequestBehavior.AllowGet );
        }

        [AllowAnonymous]
        public ActionResult Belts()
        {
            var belts = db.Belts
                .Where(b => !b.Deleted)
                .ToList()
                .Select(b => new
                {
                    ID = b.Id.ToString("N"),
                    Color = b.Color,
                    ColorHx = b.HexCode,
                    SortOrder = b.SortOrder,
                    Description = b.Description,
                })
                .OrderBy(b => b.SortOrder);

            return Json(belts, JsonRequestBehavior.AllowGet);
        }
    }
}
