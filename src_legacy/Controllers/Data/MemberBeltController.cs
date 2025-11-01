using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CoderDojo.Controllers
{
    public class MemberBeltController : Controller
    {
        private CoderDojoData db = new CoderDojoData();

        //
        // GET: /MemberBelt/

        public ActionResult Index()
        {
            var memberbelts = db.MemberBelts.Include(m => m.AwardedByAdult).Include(m => m.Belt).Include(m => m.Member);
            return View(memberbelts.ToList());
        }

        //
        // GET: /MemberBelt/Details/5

        public ActionResult Details(Guid id)
        {
            MemberBelt memberbelt = db.MemberBelts.Find(id);
            if (memberbelt == null)
            {
                return HttpNotFound();
            }
            return View(memberbelt);
        }

        //
        // GET: /MemberBelt/Create

        public ActionResult Create()
        {
            ViewBag.AwardedByAdultId = new SelectList(db.Adults, "Id", "FirstName");
            ViewBag.BeltId = new SelectList(db.Belts, "Id", "Color");
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName");
            return View();
        }

        //
        // POST: /MemberBelt/Create

        [HttpPost]
        public ActionResult Create(MemberBelt memberbelt)
        {
            if (ModelState.IsValid)
            {
                memberbelt.Id = Guid.NewGuid();
                db.MemberBelts.Add(memberbelt);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.AwardedByAdultId = new SelectList(db.Adults, "Id", "FirstName", memberbelt.AwardedByAdultId);
            ViewBag.BeltId = new SelectList(db.Belts, "Id", "Color", memberbelt.BeltId);
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName", memberbelt.MemberId);
            return View(memberbelt);
        }

        //
        // GET: /MemberBelt/Edit/5

        public ActionResult Edit(Guid id)
        {
            MemberBelt memberbelt = db.MemberBelts.Find(id);
            if (memberbelt == null)
            {
                return HttpNotFound();
            }
            ViewBag.AwardedByAdultId = new SelectList(db.Adults, "Id", "FirstName", memberbelt.AwardedByAdultId);
            ViewBag.BeltId = new SelectList(db.Belts, "Id", "Color", memberbelt.BeltId);
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName", memberbelt.MemberId);
            return View(memberbelt);
        }

        //
        // POST: /MemberBelt/Edit/5

        [HttpPost]
        public ActionResult Edit(MemberBelt memberbelt)
        {
            if (ModelState.IsValid)
            {
                db.Entry(memberbelt).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.AwardedByAdultId = new SelectList(db.Adults, "Id", "FirstName", memberbelt.AwardedByAdultId);
            ViewBag.BeltId = new SelectList(db.Belts, "Id", "Color", memberbelt.BeltId);
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName", memberbelt.MemberId);
            return View(memberbelt);
        }

        //
        // GET: /MemberBelt/Delete/5

        public ActionResult Delete(Guid id)
        {
            MemberBelt memberbelt = db.MemberBelts.Find(id);
            if (memberbelt == null)
            {
                return HttpNotFound();
            }
            return View(memberbelt);
        }

        //
        // POST: /MemberBelt/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(Guid id)
        {
            MemberBelt memberbelt = db.MemberBelts.Find(id);
            db.MemberBelts.Remove(memberbelt);
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