using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CoderDojo
{
    public class AttendanceModel
    {
        public Guid MemberId { get; set; }
        public string MemberName { get; set; }
        public string ImageUrl { get; set; }
        public string TeamImageUrl { get; set; }
        public bool Present { get; set; }

        public string MemberBeltColorHex { get; set; }
        
        public bool IsAdult { get; set; }
    }

    // Sign-in response object
    public class SignInResponse
    {
        public string memberId { get; set; }
        public string memberName { get; set; }
        public int memberSessionCount { get; set; }
        public string memberMessage { get; set; }
    }
}