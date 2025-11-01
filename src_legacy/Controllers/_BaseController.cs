using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CoderDojo
{
    public class BaseController : Controller
    {
        protected CoderDojoData db = new CoderDojoData();

        public Member GetCurrentMember()
        {
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                Guid currentUserId = HttpContext.User.Identity.GetUserId();
                return db.Members.Include(m => m.Team).FirstOrDefault(m => m.Id == currentUserId);
            }
            else
            {
                return null;
            }
        }

        public Adult GetCurrentAdult()
        {
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                Guid currentUserId = HttpContext.User.Identity.GetUserId();
                return db.Adults.FirstOrDefault(m => m.Id == currentUserId);
            }
            else
            {
                return null;
            }
        }

        public Guid CurrentUserId
        {
            get
            {
                Guid currentUserId = HttpContext.User.Identity.GetUserId();
                return currentUserId;
            }
        }

        /// <summary>
        /// Before action
        /// </summary>
        /// <param name="filterContext"></param>
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            // Set defaults
            ViewBag.HideMenuButton = false;
            ViewBag.ImageUrl = System.Configuration.ConfigurationManager.AppSettings["ImageUrl"];

            base.OnActionExecuting(filterContext);
        }

        public ActionResult RedirectClient(string url)
        {
            return View("Redirect", model: url);
        }

        public string TrimNullableString(string val)
        {
            if (val != null)
            {
                val = val.Trim();
            }
            return val;
        }

        /// <summary>
        /// Merge values from entity 2 into entity 1, if that value in entity 1 is blank
        /// </summary>
        /// <typeparam name="T">Type of value</typeparam>
        /// <param name="Entity1Value">Value from entity 1</param>
        /// <param name="Entity2Value">Value from entity 2</param>
        /// <returns>Best value</returns>
        public T MergeValues<T>(T Entity1Value, T Entity2Value)
        {
            if (Entity1Value == null)
            {
                return Entity2Value;
            }

            switch ((Entity1Value.ToString() ?? "").Trim())
            {
                case "":
                case "0":
                case "False":
                    return Entity2Value;
                default:
                    return Entity1Value;
            }
        }

        protected void DoMemberAttendanceChange(Guid memberId, bool present, DateTime sessionDate)
        {
            int sessionCount = db.MemberAttendanceSet(memberId, present, sessionDate);
            int dojoAttendanceCount = db.MemberAttendances.Count(ma => ma.Date == sessionDate) + db.AdultAttendances.Count(aa => aa.Date == sessionDate);
            Member member = db.Members.FirstOrDefault(m => m.Id == memberId);

            // Notify other members looking at this screen
            IHubContext context = GlobalHost.ConnectionManager.GetHubContext<AttendanceHub>();
            string memberMessage = "";
            if (present)
            {
                memberMessage = member.GetLoginMessage(true);
            }
            context.Clients.All.OnAttendanceChange(sessionDate.ToString("dd-MMM-yyyy"), memberId.ToString("N"), member.MemberName, (member.TeamId ?? Guid.Empty).ToString("N"), present.ToString().ToLower(), sessionCount, dojoAttendanceCount, memberMessage, member.ImageUrl);
        }

        protected void DoAdultAttendanceChange(Guid adultId, bool present, DateTime sessionDate)
        {
            int sessionCount = db.AdultAttendanceSet(adultId, present, sessionDate);
            int adultAttendanceCount = db.AdultAttendances.Count(aa => aa.Date == sessionDate);
            Adult adult = db.Adults.FirstOrDefault(a => a.Id == adultId);

            // Notify other members looking at this screen
            IHubContext context = GlobalHost.ConnectionManager.GetHubContext<AttendanceHub>();
            string memberMessage = "";
            if (present)
            {
                memberMessage = adult.GetLoginMessage(true);
            }
            context.Clients.All.OnAttendanceChange(sessionDate.ToString("dd-MMM-yyyy"), adultId.ToString("N"), adult.FullName, "Mentors", present.ToString().ToLower(), sessionCount, adultAttendanceCount, memberMessage, adult.ImageUrl);
        }

    }
}
