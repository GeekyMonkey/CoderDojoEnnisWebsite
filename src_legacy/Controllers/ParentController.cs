using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CoderDojo.Views
{
    [AuthorizeParent]
    [OutputCacheAttribute(VaryByParam = "*", Duration = 0, NoStore = true)]
    public class ParentController : BaseController
    {
        //
        // GET: /Parent/
        public ActionResult Index()
        {
            Adult parent = GetCurrentAdult();
            return View("index", parent);
        }

        [HttpGet]
        public ActionResult MyKids(Guid? id = null)
        {
            List<Member> members = (from m in db.Members
                                    from mp in db.MemberParents
                                    where m.Id == mp.MemberId
                                    && m.Deleted == false
                                    && mp.AdultId == CurrentUserId
                                    orderby m.FirstName, m.LastName
                                    select m).ToList();
            ViewBag.SelectedMemberId = id; //todo - scroll here
            ViewBag.ShowBackButton = true;
            return View("MyKids", members);
        }

        [HttpGet]
        public ActionResult MyKid(Guid id)
        {
            Member member = db.Members.FirstOrDefault(m => m.Id == id);
            if (member.MemberParents.Any(mp => mp.AdultId == CurrentUserId) == false)
            {
                throw new Exception("Attempt to view child record not associated with parent");
            }
            ViewBag.ShowBackButton = true;
            return View("MyKid", member);
        }

        [HttpGet]
        public ActionResult MyAccount()
        {
            Adult parent = GetCurrentAdult();
            return View("MyAccount", parent);
        }

        [HttpPost]
        public ActionResult MyAccountSave(Adult adultChanges)
        {
            Adult adult = db.Adults.Find(adultChanges.Id);
            if (adult == null)
            {
                throw new Exception("Account not found");
            }
            if (string.IsNullOrEmpty(adultChanges.NewPassword) == false)
            {
                adult.PasswordHash = db.GeneratePasswordHash(adultChanges.NewPassword);
            }
            adult.FirstName = adultChanges.FirstName;
            adult.LastName = adultChanges.LastName;
            adult.Email = adultChanges.Email;
            adult.Phone = adultChanges.Phone;
            db.SaveChanges();

            return RedirectClient("/Parent/MyAccount");
        }

        [HttpGet]
        public ActionResult MemberBadges(Guid id)
        {
            Member member = db.Members.FirstOrDefault(m => m.Id == id);
            if (member.MemberParents.Any(mp => mp.AdultId == CurrentUserId) == false)
            {
                throw new Exception("Attempt to view child record not associated with parent");
            }
            ViewBag.ShowBackButton = true;
            ViewBag.Badges = db.Badges
                .Include("BadgeCategory")
                //.Where(b => !b.Deleted)
                .OrderBy(b => b.BadgeCategory.CategoryName)
                .ThenBy(b => b.Achievement)
                .ToList();
            return View("MemberBadges", member);
        }

        [HttpGet]
        public ActionResult MemberAttendance(Guid id)
        {
            Member member = db.Members.FirstOrDefault(m => m.Id == id);
            if (member.MemberParents.Any(mp => mp.AdultId == CurrentUserId) == false)
            {
                throw new Exception("Attempt to view child record not associated with parent");
            }
            ViewBag.ShowBackButton = true;
            return View("MemberAttendance", member);
        }

        [HttpGet]
        public ActionResult Member(Guid id, string previousPage = "")
        {
            Member member = db.Members.FirstOrDefault(m => m.Id == id);
            if (member.MemberParents.Any(mp => mp.AdultId == CurrentUserId) == false)
            {
                throw new Exception("Attempt to view child record not associated with parent");
            }
            ViewBag.PreviousPage = previousPage;
            ViewBag.ShowBackButton = true;
            return View("Member", member);
        }

        [HttpPost]
        public ActionResult MemberSave(Member memberChanges, string previousPage)
        {
            Member member = null;

            if (ModelState.IsValid)
            {
                if (memberChanges.Id != null)
                {
                    member = db.Members.Find(memberChanges.Id);
                }
                if (member == null)
                {
                    throw new Exception("Member not found");
                }
                if (member.MemberParents.Any(mp => mp.AdultId == CurrentUserId) == false)
                {
                    throw new Exception("Attempt to view child record not associated with parent");
                }

                // Save changes
                //member.FirstName = TrimNullableString(memberChanges.FirstName).Trim();
                //member.LastName = TrimNullableString(memberChanges.LastName).Trim();
                member.BirthYear = memberChanges.BirthYear;
                member.Login = TrimNullableString(memberChanges.Login);
                member.GithubLogin = TrimNullableString(memberChanges.GithubLogin);
                member.ScratchName = TrimNullableString(memberChanges.ScratchName);
                member.XboxGamertag = TrimNullableString(memberChanges.XboxGamertag);

                // Password change
                if (string.IsNullOrEmpty(memberChanges.NewPassword) == false)
                {
                    member.PasswordHash = db.GeneratePasswordHash(memberChanges.NewPassword);
                }

                // Save
                db.SaveChanges();

                return RedirectClient("/Parent/Member/" + member.Id);
            }
            return Json("Validation error"); // todo
        }

        [HttpGet]
        public ActionResult MemberParents(Guid id)
        {
            Member member = db.Members.FirstOrDefault(m => m.Id == id);
            if (member.MemberParents.Any(mp => mp.AdultId == CurrentUserId) == false)
            {
                throw new Exception("Attempt to view child record not associated with parent");
            }
            ViewBag.ShowBackButton = true;
            return View("MemberParents", member);
        }

        [HttpGet]
        public ActionResult MemberGoals(Guid id, string previousPage = "")
        {
            Member member = db.Members.FirstOrDefault(m => m.Id == id);
            if (member.MemberParents.Any(mp => mp.AdultId == CurrentUserId) == false)
            {
                throw new Exception("Attempt to view child record not associated with parent");
            }
            ViewBag.Belts = db.Belts.Where(b => !b.Deleted).OrderBy(b => b.SortOrder).ToList();
            ViewBag.PreviousPage = previousPage;
            ViewBag.ShowBackButton = true;
            return View("MemberGoals", member);
        }

        [HttpGet]
        public ActionResult MemberBelts(Guid id)
        {
            Member member = db.Members.FirstOrDefault(m => m.Id == id);
            if (member.MemberParents.Any(mp => mp.AdultId == CurrentUserId) == false)
            {
                throw new Exception("Attempt to view child record not associated with parent");
            }
            ViewBag.ShowBackButton = true;
            ViewBag.Belts = db.Belts.Where(b => !b.Deleted).OrderBy(b => b.SortOrder).ToList();
            return View("MemberBelts", member);
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
            ViewBag.CurrentAdult = this.GetCurrentAdult();
            base.OnActionExecuting(filterContext);
        }
    }
}
