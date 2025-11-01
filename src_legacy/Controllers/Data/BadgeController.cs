using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CoderDojo.Controllers
{
    public class BadgeController : Controller
    {
        private CoderDojoData db = new CoderDojoData();

        //
        // GET: /Badge/

        public ActionResult Index()
        {
            return View(db.Badges.ToList());
        }

        //
        // GET: /Badge/Details/5

        public ActionResult Details(Guid id)
        {
            Badge badge = db.Badges.Find(id);
            if (badge == null)
            {
                return HttpNotFound();
            }
            return View(badge);
        }

        //
        // GET: /Badge/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /Badge/Create

        [HttpPost]
        public ActionResult Create(Badge badge)
        {
            if (ModelState.IsValid)
            {
                badge.Id = Guid.NewGuid();
                db.Badges.Add(badge);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(badge);
        }

        //
        // GET: /Badge/Edit/5

        public ActionResult Edit(Guid id)
        {
            Badge badge = db.Badges.Find(id);
            if (badge == null)
            {
                return HttpNotFound();
            }
            return View(badge);
        }

        //
        // POST: /Badge/Edit/5

        [HttpPost]
        public ActionResult Edit(Badge badge)
        {
            if (ModelState.IsValid)
            {
                db.Entry(badge).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(badge);
        }

        //
        // GET: /Badge/Delete/5
        public ActionResult Delete(Guid id)
        {
            Badge badge = db.Badges.Find(id);
            if (badge == null)
            {
                return HttpNotFound();
            }
            return View(badge);
        }

        //
        // POST: /Badge/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(Guid id)
        {
            Badge badge = db.Badges.Find(id);
            db.Badges.Remove(badge);
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