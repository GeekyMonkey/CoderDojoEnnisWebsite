using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CoderDojo.Controllers
{
    public class MemberBadgeController : Controller
    {
        private CoderDojoData db = new CoderDojoData();

        //
        // GET: /MemberBadge/

        public ActionResult Index()
        {
            var memberbadges = db.MemberBadges.Include(m => m.AwardedByAdult).Include(m => m.Badge).Include(m => m.Member);
            return View(memberbadges.ToList());
        }

        //
        // GET: /MemberBadge/Details/5

        public ActionResult Details(Guid id)
        {
            MemberBadge memberbadge = db.MemberBadges.Find(id);
            if (memberbadge == null)
            {
                return HttpNotFound();
            }
            return View(memberbadge);
        }

        //
        // GET: /MemberBadge/Create

        public ActionResult Create()
        {
            ViewBag.AwardedByAdultId = new SelectList(db.Adults, "Id", "FirstName");
            ViewBag.BadgeId = new SelectList(db.Badges, "Id", "Achievement");
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName");
            return View();
        }

        //
        // POST: /MemberBadge/Create

        [HttpPost]
        public ActionResult Create(MemberBadge memberbadge)
        {
            if (ModelState.IsValid)
            {
                memberbadge.Id = Guid.NewGuid();
                db.MemberBadges.Add(memberbadge);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.AwardedByAdultId = new SelectList(db.Adults, "Id", "FirstName", memberbadge.AwardedByAdultId);
            ViewBag.BadgeId = new SelectList(db.Badges, "Id", "Achievement", memberbadge.BadgeId);
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName", memberbadge.MemberId);
            return View(memberbadge);
        }

        //
        // GET: /MemberBadge/Edit/5

        public ActionResult Edit(Guid id)
        {
            MemberBadge memberbadge = db.MemberBadges.Find(id);
            if (memberbadge == null)
            {
                return HttpNotFound();
            }
            ViewBag.AwardedByAdultId = new SelectList(db.Adults, "Id", "FirstName", memberbadge.AwardedByAdultId);
            ViewBag.BadgeId = new SelectList(db.Badges, "Id", "Achievement", memberbadge.BadgeId);
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName", memberbadge.MemberId);
            return View(memberbadge);
        }

        //
        // POST: /MemberBadge/Edit/5

        [HttpPost]
        public ActionResult Edit(MemberBadge memberbadge)
        {
            if (ModelState.IsValid)
            {
                db.Entry(memberbadge).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.AwardedByAdultId = new SelectList(db.Adults, "Id", "FirstName", memberbadge.AwardedByAdultId);
            ViewBag.BadgeId = new SelectList(db.Badges, "Id", "Achievement", memberbadge.BadgeId);
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName", memberbadge.MemberId);
            return View(memberbadge);
        }

        //
        // GET: /MemberBadge/Delete/5

        public ActionResult Delete(Guid id)
        {
            MemberBadge memberbadge = db.MemberBadges.Find(id);
            if (memberbadge == null)
            {
                return HttpNotFound();
            }
            return View(memberbadge);
        }

        //
        // POST: /MemberBadge/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(Guid id)
        {
            MemberBadge memberbadge = db.MemberBadges.Find(id);
            db.MemberBadges.Remove(memberbadge);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}