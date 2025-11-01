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
    public class BadgeController : ApiController
    {
        private CoderDojoData db = new CoderDojoData();

        // GET api/Badge
        public IEnumerable<Badge> GetBadges()
        {
            return db.Badges.AsEnumerable();
        }

        // GET api/Badge/5
        public Badge GetBadge(Guid id)
        {
            Badge badge = db.Badges.Find(id);
            if (badge == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return badge;
        }

        // PUT api/Badge/5
        public HttpResponseMessage PutBadge(Guid id, Badge badge)
        {
            if (ModelState.IsValid && id == badge.Id)
            {
                db.Entry(badge).State = EntityState.Modified;

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

        // POST api/Badge
        public HttpResponseMessage PostBadge(Badge badge)
        {
            if (ModelState.IsValid)
            {
                db.Badges.Add(badge);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, badge);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = badge.Id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/Badge/5
        public HttpResponseMessage DeleteBadge(Guid id)
        {
            Badge badge = db.Badges.Find(id);
            if (badge == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Badges.Remove(badge);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, badge);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}