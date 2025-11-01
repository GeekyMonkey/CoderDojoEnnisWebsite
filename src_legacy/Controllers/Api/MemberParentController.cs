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
    public class MemberParentController : ApiController
    {
        private CoderDojoData db = new CoderDojoData();

        // GET api/MemberParent
        public IEnumerable<MemberParent> GetMemberParents()
        {
            var memberparents = db.MemberParents.Include(m => m.Adult).Include(m => m.Member);
            return memberparents.AsEnumerable();
        }

        // GET api/MemberParent/5
        public MemberParent GetMemberParent(Guid id)
        {
            MemberParent memberparent = db.MemberParents.Find(id);
            if (memberparent == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return memberparent;
        }

        // PUT api/MemberParent/5
        public HttpResponseMessage PutMemberParent(Guid id, MemberParent memberparent)
        {
            if (ModelState.IsValid && id == memberparent.Id)
            {
                db.Entry(memberparent).State = EntityState.Modified;

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

        // POST api/MemberParent
        public HttpResponseMessage PostMemberParent(MemberParent memberparent)
        {
            if (ModelState.IsValid)
            {
                db.MemberParents.Add(memberparent);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, memberparent);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = memberparent.Id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/MemberParent/5
        public HttpResponseMessage DeleteMemberParent(Guid id)
        {
            MemberParent memberparent = db.MemberParents.Find(id);
            if (memberparent == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.MemberParents.Remove(memberparent);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, memberparent);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}