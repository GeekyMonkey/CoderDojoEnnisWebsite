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
    public class TeamController : ApiController
    {
        private CoderDojoData db = new CoderDojoData();

        // GET api/Team
        public IEnumerable<Team> GetTeams()
        {
            return db.Teams.AsEnumerable();
        }

        // GET api/Team/5
        public Team GetTeam(Guid id)
        {
            Team team = db.Teams.Find(id);
            if (team == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return team;
        }

        // PUT api/Team/5
        public HttpResponseMessage PutTeam(Guid id, Team team)
        {
            if (ModelState.IsValid && id == team.Id)
            {
                db.Entry(team).State = EntityState.Modified;

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

        // POST api/Team
        public HttpResponseMessage PostTeam(Team team)
        {
            if (ModelState.IsValid)
            {
                db.Teams.Add(team);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, team);
                response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = team.Id }));
                return response;
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        // DELETE api/Team/5
        public HttpResponseMessage DeleteTeam(Guid id)
        {
            Team team = db.Teams.Find(id);
            if (team == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Teams.Remove(team);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            return Request.CreateResponse(HttpStatusCode.OK, team);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}