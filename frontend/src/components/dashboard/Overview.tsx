import { motion } from "framer-motion";
import { useStore } from "../../store";
import {
  Lightbulb,
  Users,
  TrendingUp,
  Award,
  Shield,
  CheckCircle,
  Sparkles,
  Calendar,
  Target,
  MessageSquare,
  User,
  Bot,
} from "lucide-react";

export default function Overview() {
  const { user, ideas, requests, certificates, darkMode, setProfileToView } =
    useStore();

  if (!user) return null;

  const userIdeas = (ideas || []).filter((i) => i.userId === user.id);
  const pendingRequests = (requests || []).filter(
    (r) => r.status === "pending" && r.ownerId === user.id,
  );
  const activeProjects = (ideas || []).filter(
    (i) =>
      (i.userId === user.id || (i.collaborators || []).includes(user.id)) &&
      (i.status === "in_review" || i.status === "pending_review"),
  ).length;
  const completedProjects = (ideas || []).filter(
    (i) =>
      (i.userId === user.id || (i.collaborators || []).includes(user.id)) &&
      i.status === "completed",
  ).length;
  const trustScore = Math.max(
    user.trustScore,
    userIdeas.length > 0 ? 70 : user.trustScore,
  );

  const stats = [
    {
      label: "Ideas Posted",
      value: userIdeas.length,
      icon: Lightbulb,
      color: "from-orange-500 to-orange-400",
    },
    {
      label: "Active Projects",
      value: activeProjects,
      icon: Users,
      color: "from-blue-400 to-blue-600",
    },
    {
      label: "Completed",
      value: completedProjects,
      icon: CheckCircle,
      color: "from-green-400 to-green-600",
    },
    {
      label: "Trust Score",
      value: trustScore,
      icon: Shield,
      color: "from-purple-400 to-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 shadow-sm rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => setProfileToView(user)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium transition-colors cursor-hover"
            >
              <User className="w-3 h-3" /> View My Id
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back,{" "}
            <span className="gradient-text">{user.displayName}</span>!
          </h1>
          <p className="text-gray-500 max-w-xl">
            {user.role === "owner"
              ? "Continue solving real problems with talented builders."
              : "Find exciting projects to build and grow your skills."}
          </p>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.5) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 card-3d"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {user.role === "owner" ? (
              <>
                <a
                  href="/dashboard/my-ideas"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-hover transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Post New Idea
                    </div>
                    <div className="text-sm text-gray-500">
                      Share your problem with builders
                    </div>
                  </div>
                </a>
                <a
                  href="/dashboard/requests"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-hover transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Review Requests
                    </div>
                    <div className="text-sm text-gray-500">
                      {pendingRequests.length} pending requests
                    </div>
                  </div>
                </a>
                <a
                  href="/dashboard/nexus-ai"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-hover transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Nexus AI</div>
                    <div className="text-sm text-gray-500">
                      Refine your idea and shortlist better builders
                    </div>
                  </div>
                </a>
              </>
            ) : (
              <>
                <a
                  href="/dashboard/my-ideas"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-hover transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Post & Validate Idea
                    </div>
                    <div className="text-sm text-gray-500">
                      Run CMVC and add it to your personal projects
                    </div>
                  </div>
                </a>
                <a
                  href="/dashboard/browse-ideas"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-hover transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Browse Ideas
                    </div>
                    <div className="text-sm text-gray-500">
                      Find projects to work on
                    </div>
                  </div>
                </a>
                <a
                  href="/dashboard/chat"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-hover transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Messages</div>
                    <div className="text-sm text-gray-500">
                      Check your conversations
                    </div>
                  </div>
                </a>
                <a
                  href="/dashboard/nexus-ai"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-hover transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Nexus AI</div>
                    <div className="text-sm text-gray-500">
                      Get proposal help and match-fit guidance
                    </div>
                  </div>
                </a>
              </>
            )}
          </div>
        </motion.div>

        {/* Recent Activity / Certificates based on Role */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6"
        >
          {user.role === "owner" ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Recent Ideas
              </h2>
              {userIdeas.length > 0 ? (
                <div className="space-y-3">
                  {userIdeas.slice(0, 3).map((idea) => (
                    <div
                      key={idea.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {idea.title}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {idea.status.replace("_", " ")} •{" "}
                          {idea.collaborators?.length || 0} collaborators
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No ideas posted yet</p>
                  <p className="text-sm text-gray-400">
                    Share your first problem to get started
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-900">
                Your Posted Ideas
              </h2>
              {userIdeas.length > 0 ? (
                <div className="space-y-3 mb-5">
                  {(userIdeas || []).slice(0, 2).map((idea) => (
                    <div
                      key={idea.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {idea.title}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {idea.status.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 mb-4">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No personal ideas posted yet</p>
                  <p className="text-sm text-gray-400">
                    Post from My Ideas and run CMVC to move them into your
                    projects
                  </p>
                </div>
              )}

              <h3 className="text-lg font-bold mb-3 text-gray-900">
                Your Certificates
              </h3>
              { (certificates || []).length > 0 ? (
                <div className="space-y-3">
                  {(certificates || []).slice(0, 2).map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {cert.projectTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cert.type} •{" "}
                          {new Date(cert.earnedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-400">No certificates yet</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
