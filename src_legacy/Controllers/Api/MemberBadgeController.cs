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
    public class MemberBadgeController : ApiController
    {
        private CoderDojoData db = new CoderDojoData();

        // GET api/MemberBadge
        public IEnumerable<MemberBadge> GetMemberBadges()
        {
            var memberbadges = db.MemberBadges.Include(m => m.AwardedByAdult).Include(m => m.Badge).Include(m => m.Member);
            return memberbadges.AsEnumerable();
        }

        // GET api/MemberBadge/5
        public MemberBadge GetMemberBadge(Guid id)
        {
            MemberBadge memberbadge = db.MemberBadges.Find(id);
            if (memberbadge == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return memberbadge;
        }

        // PUT api/MemberBadge/5
        public HttpResponseMessage PutMemberBadge(Guid id, MemberBadge memberbadge)
        {
            if (ModelState.IsValid && id == memberbadge.Id)
            {
                db.Entry(memberbadge).State = EntityState.Modified;

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

        // POST api/MemberBadge
        public HttpResponseMessage PostMemberBadge(MemberBadge memberbadge)
        {
            if (ModelState.IsValid)
            {
                db.MemberBadges.Add(memberbadge);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, memberbadge);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = memberbadge.Id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/MemberBadge/5
        public HttpResponseMessage DeleteMemberBadge(Guid id)
        {
            MemberBadge memberbadge = db.MemberBadges.Find(id);
            if (memberbadge == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.MemberBadges.Remove(memberbadge);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, memberbadge);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}