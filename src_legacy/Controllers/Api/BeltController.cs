using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace CoderDojo.Controllers.Api
{
    public class BeltController : ApiController
    {
        private CoderDojoData db = new CoderDojoData();

        // GET api/Belt
        public IEnumerable<Belt> GetBelts()
        {
            return db.Belts.AsEnumerable();
        }

        // GET api/Belt/5
        public Belt GetBelt(Guid id)
        {
            Belt belt = db.Belts.Find(id);
            if (belt == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return belt;
        }

        // PUT api/Belt/5
        public HttpResponseMessage PutBelt(Guid id, Belt belt)
        {
            if (ModelState.IsValid && id == belt.Id)
            {
                db.Entry(belt).State = EntityState.Modified;

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

        // POST api/Belt
        public HttpResponseMessage PostBelt(Belt belt)
        {
            if (ModelState.IsValid)
            {
                db.Belts.Add(belt);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, belt);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = belt.Id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/Belt/5
        public HttpResponseMessage DeleteBelt(Guid id)
        {
            Belt belt = db.Belts.Find(id);
            if (belt == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Belts.Remove(belt);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, belt);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}