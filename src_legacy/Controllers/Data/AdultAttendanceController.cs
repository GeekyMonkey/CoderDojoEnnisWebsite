using System;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;

namespace CoderDojo.Controllers
{
    public class AdultAttendanceController : Controller
    {
        private CoderDojoData db = new CoderDojoData();

        //
        // GET: /AdultAttendance/

        public ActionResult Index()
        {
            var adultattendances = db.AdultAttendances.Include(m => m.Adult);
            return View(adultattendances.ToList());
        }

        //
        // GET: /AdultAttendance/Details/5

        public ActionResult Details(Guid id)
        {
            AdultAttendance adultattendance = db.AdultAttendances.Find(id);
            if (adultattendance == null)
            {
                return HttpNotFound();
            }
            return View(adultattendance);
        }

        //
        // GET: /AdultAttendance/Create

        public ActionResult Create()
        {
            ViewBag.AdultId = new SelectList(db.Adults, "Id", "FirstName");
            return View();
        }

        //
        // POST: /AdultAttendance/Create

        [HttpPost]
        public ActionResult Create(AdultAttendance adultattendance)
        {
            if (ModelState.IsValid)
            {
                adultattendance.Id = Guid.NewGuid();
                db.AdultAttendances.Add(adultattendance);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.AdultId = new SelectList(db.Adults, "Id", "FirstName", adultattendance.AdultId);
            return View(adultattendance);
        }

        //
        // GET: /AdultAttendance/Edit/5

        public ActionResult Edit(Guid id)
        {
            AdultAttendance adultattendance = db.AdultAttendances.Find(id);
            if (adultattendance == null)
            {
                return HttpNotFound();
            }
            ViewBag.AdultId = new SelectList(db.Adults, "Id", "FirstName", adultattendance.AdultId);
            return View(adultattendance);
        }

        //
        // POST: /AdultAttendance/Edit/5

        [HttpPost]
        public ActionResult Edit(AdultAttendance adultattendance)
        {
            if (ModelState.IsValid)
            {
                db.Entry(adultattendance).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.AdultId = new SelectList(db.Adults, "Id", "FirstName", adultattendance.AdultId);
            return View(adultattendance);
        }

        //
        // GET: /AdultAttendance/Delete/5

        public ActionResult Delete(Guid id)
        {
            AdultAttendance adultattendance = db.AdultAttendances.Find(id);
            if (adultattendance == null)
            {
                return HttpNotFound();
            }
            return View(adultattendance);
        }

        //
        // POST: /AdultAttendance/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(Guid id)
        {
            AdultAttendance adultattendance = db.AdultAttendances.Find(id);
            db.AdultAttendances.Remove(adultattendance);
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