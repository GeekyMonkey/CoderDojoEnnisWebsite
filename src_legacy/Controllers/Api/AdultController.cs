using AutoMapper;
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
    public class AdultController : ApiController
    {
        private CoderDojoData db = new CoderDojoData();

        // GET api/Adult
        public IEnumerable<ApiAdult> GetAdults()
        {
            var adults = db.Adults.OrderBy(a => a.FirstName).ThenBy(a => a.LastName).ToList();
            List<ApiAdult> apiAdults = Mapper.Map<List<Adult>, List<ApiAdult>>(adults);
            return apiAdults.AsEnumerable();
        }

        // GET api/Adult/5
        public ApiAdult GetAdult(Guid id)
        {
            Adult adult = db.Adults.Find(id);
            if (adult == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return Mapper.Map<ApiAdult>(adult);
        }

        // PUT api/Adult/5
        public HttpResponseMessage PutAdult(Guid id, ApiAdult apiAdult)
        {
            var adult = Mapper.Map<Adult>(apiAdult);
            if (ModelState.IsValid && id == adult.Id)
            {
                db.Entry(adult).State = EntityState.Modified;

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

        // POST api/Adult
        public HttpResponseMessage PostAdult(ApiAdult apiAdult)
        {
            var adult = Mapper.Map<Adult>(apiAdult);
            if (ModelState.IsValid)
            {
                db.Adults.Add(adult);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, adult);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = adult.Id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/Adult/5
        public HttpResponseMessage DeleteAdult(Guid id)
        {
            Adult adult = db.Adults.Find(id);
            if (adult == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Adults.Remove(adult);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, adult);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}