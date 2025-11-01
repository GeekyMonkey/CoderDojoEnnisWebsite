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
    public class MemberBeltController : ApiController
    {
        private CoderDojoData db = new CoderDojoData();

        // GET api/MemberBelt
        public IEnumerable<MemberBelt> GetMemberBelts()
        {
            var memberbelts = db.MemberBelts.Include(m => m.AwardedByAdult).Include(m => m.Belt).Include(m => m.Member);
            return memberbelts.AsEnumerable();
        }

        // GET api/MemberBelt/5
        public MemberBelt GetMemberBelt(Guid id)
        {
            MemberBelt memberbelt = db.MemberBelts.Find(id);
            if (memberbelt == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return memberbelt;
        }

        // PUT api/MemberBelt/5
        public HttpResponseMessage PutMemberBelt(Guid id, MemberBelt memberbelt)
        {
            if (ModelState.IsValid && id == memberbelt.Id)
            {
                db.Entry(memberbelt).State = EntityState.Modified;

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

        // POST api/MemberBelt
        public HttpResponseMessage PostMemberBelt(MemberBelt memberbelt)
        {
            if (ModelState.IsValid)
            {
                db.MemberBelts.Add(memberbelt);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, memberbelt);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = memberbelt.Id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/MemberBelt/5
        public HttpResponseMessage DeleteMemberBelt(Guid id)
        {
            MemberBelt memberbelt = db.MemberBelts.Find(id);
            if (memberbelt == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.MemberBelts.Remove(memberbelt);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, memberbelt);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}