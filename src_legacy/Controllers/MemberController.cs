using Microsoft.Ajax.Utilities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Mvc;

namespace CoderDojo.Views
{
    [AuthorizeMember]
    [OutputCacheAttribute(VaryByParam = "*", Duration = 0, NoStore = true)]
    public class MemberController : BaseController
    {
        //
        // GET: /Member/
        public ActionResult Index()
        {
            Member member = GetCurrentMember();
            return View("Index", member);
        }

        [HttpGet]
        new public ActionResult Profile()
        {
            Member member = GetCurrentMember();
            return View("Profile", member);
        }

        [HttpPost]
        public ActionResult ProfileSave(Member memberChanges)
        {
            Member member = GetCurrentMember();
            member.GithubLogin = memberChanges.GithubLogin;
            member.XboxGamertag = memberChanges.XboxGamertag;
            member.ScratchName = memberChanges.ScratchName;
            member.GoalShortTerm = memberChanges.GoalShortTerm;
            member.GoalLongTerm = memberChanges.GoalLongTerm;
            db.SaveChanges();
            return RedirectClient("/Member/Profile");
        }

        [HttpPost]
        public ActionResult MemberGoalChange(Guid MemberId, Guid BadgeId, bool IsGoal)
        {
            Member member = GetCurrentMember();
            var now = DateTime.UtcNow;
            var memberbadge = member.MemberBadges.FirstOrDefault((b) => b.BadgeId == BadgeId);
            if (IsGoal == true) {
                // Add Goal
                if (memberbadge == null)
                {
                    memberbadge = new MemberBadge();
                    memberbadge.Id = Guid.NewGuid();
                    db.MemberBadges.Add(memberbadge);
                }
                memberbadge.MemberId = member.Id;
                memberbadge.BadgeId = BadgeId;
                memberbadge.GoalDate = now;
            } else
            {
                // Remove Goal
                if (memberbadge != null)
                {
                    memberbadge.GoalDate = null;
                }
            }
            db.SaveChanges();
            return Json("OK");
        }

        [HttpGet]
        public ActionResult Goals()
        {
            Member member = GetCurrentMember();
            ViewBag.Belts = db.Belts.Where(b => !b.Deleted).OrderBy(b => b.SortOrder).ToList();
            return View("Goals", member);
        }

        [HttpGet]
        public ActionResult Badges()
        {
            Member member = GetCurrentMember();
            var badges = from badge in db.Badges
                         // where badge.Deleted == false
                         orderby badge.BadgeCategory.CategoryName, badge.Achievement
                         select badge;
            return View("Badges", badges.ToList());
        }

        [HttpGet]
        public ActionResult BadgesAvailable()
        {
            Member member = GetCurrentMember();
            var badges = from badge in db.Badges
                         // where badge.Deleted == false
                         orderby badge.BadgeCategory.CategoryName, badge.Achievement
                         select badge;
            ViewBag.BadgeCategories = GetBadgeCategories();
            return View("BadgesAvailable", badges.ToList());
        }

        [HttpGet]
        public ActionResult Belts()
        {
            var belts = from belt in db.Belts
                        where belt.Deleted == false
                        orderby belt.SortOrder
                        select belt;
            return View("Belts", belts.ToList());
        }

        [HttpGet]
        public ActionResult Attendance()
        {
            Member member = GetCurrentMember();
            return View("Attendance", member);
        }

        [HttpPost]
        public ActionResult BeltApplication(Guid id, string message)
        {
            Guid currentMemberId = GetCurrentMember().Id;

            // Check for an existing open application
            bool alreadyApplied = db.MemberBelts.Any(
                mb => mb.MemberId == currentMemberId
                    && mb.BeltId == id
                    && mb.Awarded == null
                    && mb.RejectedDate == null);
            if (alreadyApplied)
            {
                return Json("OK");
            }

            Guid beltId = id;
            MemberBelt application = new MemberBelt
            {
                MemberId = GetCurrentMember().Id,
                BeltId = beltId,
                ApplicationDate = DateTime.UtcNow,
                ApplicationNotes = message
            };
            db.MemberBelts.Add(application);
            db.SaveChanges();
            return Json("OK");
        }

        [HttpPost]
        public ActionResult BadgeApplication(Guid id, string message)
        {
            Guid currentMemberId = GetCurrentMember().Id;

            // Check for an existing open application
            bool alreadyApplied = db.MemberBadges.Any(
                mb => mb.MemberId == currentMemberId
                    && mb.BadgeId == id
                    && mb.ApplicationDate != null
                    && mb.Awarded == null
                    && mb.RejectedDate == null);
            if (alreadyApplied)
            {
                return Json("OK");
            }

            Guid badgeId = id;
            MemberBadge application = db.MemberBadges.FirstOrDefault(mb => mb.MemberId == currentMemberId && mb.BadgeId == id && mb.ApplicationDate == null);
            if (application == null)
            {
                // New application - not from goal
                application = new MemberBadge
                {
                    MemberId = currentMemberId,
                    BadgeId = badgeId,
                    ApplicationDate = DateTime.UtcNow,
                    ApplicationNotes = message
                };
                db.MemberBadges.Add(application);
            }
            else
            {
                // Upgrade a goal badge
                application.ApplicationDate = DateTime.UtcNow;
                application.ApplicationNotes = message;
                db.Entry(application).State = EntityState.Modified;
            }

            db.SaveChanges();
            return Json("OK");
        }

        /// <summary>
        /// Sessions Maintenance
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public ActionResult Sessions()
        {
            DateTime now = DateTime.UtcNow;
            List<Session> sessions = db.Sessions
                .Where(s => s.EndDate > now && s.MentorsOnly == false)
                .OrderBy(s => s.Topic)
                .ToList();
            ViewBag.UserId = this.User.Identity.Name.Split('|')[1];
            return View("Sessions", sessions);
        }

        public ActionResult TeamMember(Guid id)
        {
            Member otherMember = db.Members.FirstOrDefault(m => m.Id == id);
            return View("TeamMember", otherMember);
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            ViewBag.CurrentMember = this.GetCurrentMember();
            base.OnActionExecuting(filterContext);
        }

        private IEnumerable<BadgeCategory> GetBadgeCategories()
        {
            return db.BadgeCategories
                .Where(bc => bc.Deleted == false)
                .OrderBy(bc => bc.CategoryName)
                .ToList();
        }
    }
}
