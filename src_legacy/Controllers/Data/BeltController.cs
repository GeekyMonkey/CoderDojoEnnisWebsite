using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CoderDojo.Controllers
{
    public class BeltController : Controller
    {
        private CoderDojoData db = new CoderDojoData();

        //
        // GET: /Belt/

        public ActionResult Index()
        {
            return View(db.Belts.ToList());
        }

        //
        // GET: /Belt/Details/5

        public ActionResult Details(Guid id)
        {
            Belt belt = db.Belts.Find(id);
            if (belt == null)
            {
                return HttpNotFound();
            }
            return View(belt);
        }

        //
        // GET: /Belt/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /Belt/Create

        [HttpPost]
        public ActionResult Create(Belt belt)
        {
            if (ModelState.IsValid)
            {
                belt.Id = Guid.NewGuid();
                db.Belts.Add(belt);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(belt);
        }

        //
        // GET: /Belt/Edit/5

        public ActionResult Edit(Guid id)
        {
            Belt belt = db.Belts.Find(id);
            if (belt == null)
            {
                return HttpNotFound();
            }
            return View(belt);
        }

        //
        // POST: /Belt/Edit/5

        [HttpPost]
        public ActionResult Edit(Belt belt)
        {
            if (ModelState.IsValid)
            {
                db.Entry(belt).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(belt);
        }

        //
        // GET: /Belt/Delete/5

        public ActionResult Delete(Guid id)
        {
            Belt belt = db.Belts.Find(id);
            if (belt == null)
            {
                return HttpNotFound();
            }
            return View(belt);
        }

        //
        // POST: /Belt/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(Guid id)
        {
            Belt belt = db.Belts.Find(id);
            db.Belts.Remove(belt);
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