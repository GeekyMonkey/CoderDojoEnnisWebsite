using System;
using Microsoft.AspNet.SignalR;

namespace CoderDojo
{
    public class SessionHub : Hub
    {
        public void OnSessionChange(Guid sessionId)
        {
            // Call te broadcastMessage method to update clients.
            Clients.Others.OnSessionChange(sessionId);
        }
    }
}
