using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CoderDojo.Controllers
{
    public class MemberAttendanceController : Controller
    {
        private CoderDojoData db = new CoderDojoData();

        //
        // GET: /MemberAttendance/

        public ActionResult Index()
        {
            var memberattendances = db.MemberAttendances.Include(m => m.Member);
            return View(memberattendances.ToList());
        }

        //
        // GET: /MemberAttendance/Details/5

        public ActionResult Details(Guid id)
        {
            MemberAttendance memberattendance = db.MemberAttendances.Find(id);
            if (memberattendance == null)
            {
                return HttpNotFound();
            }
            return View(memberattendance);
        }

        //
        // GET: /MemberAttendance/Create

        public ActionResult Create()
        {
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName");
            return View();
        }

        //
        // POST: /MemberAttendance/Create

        [HttpPost]
        public ActionResult Create(MemberAttendance memberattendance)
        {
            if (ModelState.IsValid)
            {
                memberattendance.Id = Guid.NewGuid();
                db.MemberAttendances.Add(memberattendance);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName", memberattendance.MemberId);
            return View(memberattendance);
        }

        //
        // GET: /MemberAttendance/Edit/5

        public ActionResult Edit(Guid id)
        {
            MemberAttendance memberattendance = db.MemberAttendances.Find(id);
            if (memberattendance == null)
            {
                return HttpNotFound();
            }
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName", memberattendance.MemberId);
            return View(memberattendance);
        }

        //
        // POST: /MemberAttendance/Edit/5

        [HttpPost]
        public ActionResult Edit(MemberAttendance memberattendance)
        {
            if (ModelState.IsValid)
            {
                db.Entry(memberattendance).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            ViewBag.MemberId = new SelectList(db.Members, "Id", "FirstName", memberattendance.MemberId);
            return View(memberattendance);
        }

        //
        // GET: /MemberAttendance/Delete/5

        public ActionResult Delete(Guid id)
        {
            MemberAttendance memberattendance = db.MemberAttendances.Find(id);
            if (memberattendance == null)
            {
                return HttpNotFound();
            }
            return View(memberattendance);
        }

        //
        // POST: /MemberAttendance/Delete/5

        [HttpPost, ActionName("Delete")]
        public ActionResult DeleteConfirmed(Guid id)
        {
            MemberAttendance memberattendance = db.MemberAttendances.Find(id);
            db.MemberAttendances.Remove(memberattendance);
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