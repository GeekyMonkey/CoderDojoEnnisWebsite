using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CoderDojo.Controllers.Api
{
    public class AdultAttendanceController : ApiController
    {
        private CoderDojoData db = new CoderDojoData();

        // GET api/AdultAttendance
        public IEnumerable<AdultAttendance> GetAdultAttendances()
        {
            var adultattendances = db.AdultAttendances.Include(m => m.Adult);
            return adultattendances.AsEnumerable();
        }

        // GET api/AdultAttendance/5
        public AdultAttendance GetAdultAttendance(Guid id)
        {
            AdultAttendance adultattendance = db.AdultAttendances.Find(id);
            if (adultattendance == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return adultattendance;
        }

        // PUT api/AdultAttendance/5
        public HttpResponseMessage PutAdultAttendance(Guid id, AdultAttendance adultAttendance)
        {
            if (ModelState.IsValid && id == adultAttendance.Id)
            {
                db.Entry(adultAttendance).State = EntityState.Modified;

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // POST api/AdultAttendance
        public HttpResponseMessage PostAdultAttendance(AdultAttendance adultattendance)
        {
            if (ModelState.IsValid)
            {
                db.AdultAttendances.Add(adultattendance);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, adultattendance);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = adultattendance.Id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/AdultAttendance/5
        public HttpResponseMessage DeleteAdultAttendance(Guid id)
        {
            AdultAttendance adultattendance = db.AdultAttendances.Find(id);
            if (adultattendance == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.AdultAttendances.Remove(adultattendance);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, adultattendance);
        }

        /// <summary>
        /// Clean up
        /// </summary>
        /// <param name="disposing">Is Disposing</param>
        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}