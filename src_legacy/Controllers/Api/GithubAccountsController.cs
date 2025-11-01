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
using System.Web.Http.Cors;

namespace CoderDojo.Controllers.Api
{
    public class GithubUser
    {
        public string FirstName;
        public string LastName;
        public string GithubLogin;
    }

    public class GithubUsersCollection
    {
        public List<GithubUser> Members;
        public List<GithubUser> Mentors;
    }

    public class GithubAccountsController : ApiController
    {
        private CoderDojoData db = new CoderDojoData();

        // GET api/GithubAccounts
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        public GithubUsersCollection GetMemberAttendances()
        {

            GithubUsersCollection githubUsers = new GithubUsersCollection
            {
                Members = (from m in db.Members
                           where m.Deleted == false && m.GithubLogin != null && m.GithubLogin != ""
                           orderby m.FirstName, m.LastName
                           select new GithubUser
                           {
                               FirstName = m.FirstName,
                               LastName = m.LastName,
                               GithubLogin = m.GithubLogin
                           }).ToList(),
                Mentors = (from m in db.Adults
                           where m.Deleted == false && m.IsMentor == true && m.GithubLogin != null && m.GithubLogin != ""
                           orderby m.FirstName, m.LastName
                           select new GithubUser
                           {
                               FirstName = m.FirstName,
                               LastName = m.LastName,
                               GithubLogin = m.GithubLogin
                           }).ToList()
            };
            return githubUsers;
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}