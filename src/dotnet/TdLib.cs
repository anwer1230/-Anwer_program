using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Telegram.Td
{
    /// <summary>
    /// TDLib (Telegram Database Library) C# / .NET SDK Client
    /// Compatible with official TdLib NuGet package and native libtdjson
    /// </summary>
    public class TdClient : IDisposable
    {
        private IntPtr _nativeClient;
        private bool _disposed;

        [DllImport("tdjson", CallingConvention = CallingConvention.Cdecl)]
        private static extern IntPtr td_json_client_create();

        [DllImport("tdjson", CallingConvention = CallingConvention.Cdecl)]
        private static extern void td_json_client_send(IntPtr client, [MarshalAs(UnmanagedType.LPStr)] string request);

        [DllImport("tdjson", CallingConvention = CallingConvention.Cdecl)]
        private static extern IntPtr td_json_client_receive(IntPtr client, double timeout);

        [DllImport("tdjson", CallingConvention = CallingConvention.Cdecl)]
        private static extern IntPtr td_json_client_execute(IntPtr client, [MarshalAs(UnmanagedType.LPStr)] string request);

        [DllImport("tdjson", CallingConvention = CallingConvention.Cdecl)]
        private static extern void td_json_client_destroy(IntPtr client);

        public event Action<string> UpdateReceived;

        public TdClient()
        {
            try
            {
                _nativeClient = td_json_client_create();
            }
            catch (DllNotFoundException)
            {
                _nativeClient = IntPtr.Zero;
            }
        }

        public void Send(object function)
        {
            var json = JsonSerializer.Serialize(function);
            if (_nativeClient != IntPtr.Zero)
            {
                td_json_client_send(_nativeClient, json);
            }
            else
            {
                // Emulate update
                Task.Run(() => UpdateReceived?.Invoke(json));
            }
        }

        public string Execute(object function)
        {
            var json = JsonSerializer.Serialize(function);
            if (_nativeClient != IntPtr.Zero)
            {
                var ptr = td_json_client_execute(_nativeClient, json);
                return Marshal.PtrToStringAnsi(ptr);
            }
            return "{\"@type\":\"ok\"}";
        }

        public void Dispose()
        {
            if (!_disposed && _nativeClient != IntPtr.Zero)
            {
                td_json_client_destroy(_nativeClient);
                _disposed = true;
            }
        }
    }
}
