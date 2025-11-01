using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CoderDojo.Controllers
{
    public class AdultController : Controller
    {
        private CoderDojoData db = new CoderDojoData();

        //
        // GET: /Adult/

        public ActionResult Index()
        {
            return View(db.Adults.ToList());
        }

        //
        // GET: /Adult/Details/5

        public ActionResult Details(Guid id)
        {
            Adult adult = db.Adults.Find(id);
            if (adult == null)
            {
                return HttpNotFound();
            }
            return View(adult);
        }

        //
        // GET: /Adult/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /Adult/Create
        [HttpPost]
        public ActionResult Create(Adult adult)
        {
            if (ModelState.IsValid)
            {
                adult.Id = Guid.NewGuid();
                db.Adults.Add(adult);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(adult);
        }

        //
        // GET: /Adult/Edit/5
        public ActionResult Edit(Guid id)
        {
            Adult adult = db.Adults.Find(id);
            if (adult == null)
            {
                return HttpNotFound();
            }
            return View(adult);
        }

        //
        // POST: /Adult/Edit/5
        [HttpPost]
        public ActionResult Edit(Adult adult)
        {
            if (ModelState.IsValid)
            {
                db.Entry(adult).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(adult);
        }

        //
        // GET: /Adult/Delete/5

        public ActionResult Delete(Guid id)
        {
            Adult adult = db.Adults.Find(id);
            if (adult == null)
            {
                return HttpNotFound();
            }
            return View(adult);
        }

        //
        // POST: /Adult/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(Guid id)
        {
            Adult adult = db.Adults.Find(id);
            db.Adults.Remove(adult);
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