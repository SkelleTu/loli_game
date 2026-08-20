using UnityEngine;

namespace LoliGame
{
    public sealed class LoliGameBootstrap : MonoBehaviour
    {
        [SerializeField] private string backendHealthUrl = "http://localhost:3000/health";

        private void Awake()
        {
            Application.runInBackground = true;
            Application.targetFrameRate = 60;
        }

        private void Start()
        {
            Debug.Log($"LoliGame Unity client started. Backend endpoint: {backendHealthUrl}");
        }
    }
}
