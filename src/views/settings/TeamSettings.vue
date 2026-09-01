<template>
  <div class="flex flex-col gap-4 p-4 bg-white-10 max-w-full overflow-hidden">
    <!-- Tabs Header -->
    <div class="flex gap-4 border-b border-border/40 pb-3 mb-2">
      <button
        @click="activeTab = 'users'"
        class="text-sm font-semibold transition-colors relative"
        :class="
          activeTab === 'users'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        "
      >
        Users
        <div
          v-if="activeTab === 'users'"
          class="absolute left-0 right-0 bottom-[-14px] h-[2px] bg-primary rounded-full"
        />
      </button>
      <button
        @click="activeTab = 'log'"
        class="text-sm font-semibold transition-colors relative"
        :class="
          activeTab === 'log'
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        "
      >
        Activity log
        <div
          v-if="activeTab === 'log'"
          class="absolute left-0 right-0 bottom-[-14px] h-[2px] bg-primary rounded-full"
        />
      </button>
    </div>

    <!-- Users Tab Content -->
    <div v-if="activeTab === 'users'" class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <p class="text-sm text-muted-foreground max-w-xl">
          Together with your team, expand your brand globally and fulfill each
          order with dedication, excellence, and care.
        </p>
        <button
          @click="showInvite = true"
          class="bg-black hover:bg-black/90 text-white px-4 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors shadow-sm"
        >
          Invite Team Member
        </button>
      </div>

      <!-- Categories and Lists -->
      <template v-if="loadingTeam">
        <SettingsSkeleton variant="section" :count="3" show-avatar />
        <SettingsSkeleton variant="section" :count="2" show-avatar />
      </template>
      <template v-else>
      <div
        v-for="group in groups"
        :key="group.label"
        class="flex flex-col gap-3"
      >
        <p
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2"
        >
          {{ group.label }}
        </p>
        <div
          class="rounded-xl border bg-white-10 overflow-hidden divide-y divide-border/50 shadow-sm"
        >
          <div
            v-for="m in group.members"
            :key="m.id"
            @click="openMemberProfile(m)"
            class="flex items-center justify-between px-5 py-3.5 hover:bg-muted/10 transition-colors cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="m.avatar"
                :src="m.avatar"
                class="size-9 rounded-full object-cover shrink-0 border border-border/40"
                alt=""
              />
              <div
                v-else
                class="size-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0"
              >
                {{ m.name[0] }}
              </div>
              <div>
                <p class="text-xs font-bold text-foreground">{{ m.name }}</p>
                <p class="text-[10px] text-muted-foreground mt-0.5">
                  {{ m.brands }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-muted-foreground">{{ m.status }}</span>
              <ChevronRight class="size-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
      </template>
    </div>

    <!-- Activity Log Tab Content -->
    <div v-else class="flex flex-col gap-4">
      <p class="text-sm text-muted-foreground max-w-3xl mb-2">
        Monitor and track the activities of all users within the system on the
        User Activity Log page. This comprehensive overview provides detailed
        insights for effective management and analysis.
      </p>
      <div class="rounded-xl border bg-white-10 overflow-hidden shadow-sm">
        <SettingsSkeleton v-if="loadingLogs" variant="rows" :count="5" />
        <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs min-w-[600px]">
            <thead>
              <tr
                class="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]"
              >
                <th class="px-5 py-3">Name</th>
                <th class="px-5 py-3">Action</th>
                <th class="px-5 py-3">IP Address</th>
                <th class="px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-border/50 text-foreground font-semibold"
            >
              <tr
                v-for="log in activityLogs"
                :key="log.id"
                class="hover:bg-muted/5 transition-colors"
              >
                <td class="px-5 py-3.5">{{ log.name }}</td>
                <td class="px-5 py-3.5" v-html="log.action"></td>
                <td class="px-5 py-3.5 text-muted-foreground font-mono">
                  {{ log.ip }}
                </td>
                <td class="px-5 py-3.5 text-muted-foreground">{{ log.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div
          class="flex items-center justify-end gap-4 px-5 py-3 border-t border-border bg-muted/10 text-xs"
        >
          <div class="flex items-center gap-2">
            <span class="text-muted-foreground">Rows per page</span>
            <AppSelect
              v-model="rowsPerPage"
              :options="[10, 20, 50]"
              customClass="rounded border border-border bg-background px-2 py-1 focus:outline-none"
            />
          </div>
          <span class="text-muted-foreground font-medium">{{ startIndex }}-{{ endIndex }} of {{ totalLogs }}</span>
          <div class="flex items-center gap-1">
            <button
              @click="page = 1"
              :disabled="page <= 1"
              class="size-7 rounded hover:bg-muted flex items-center justify-center text-muted-foreground disabled:opacity-40"
            >
              <ChevronsLeft class="size-4" />
            </button>
            <button
              @click="page--"
              :disabled="page <= 1"
              class="size-7 rounded hover:bg-muted flex items-center justify-center text-muted-foreground disabled:opacity-40"
            >
              <ChevronLeft class="size-4" />
            </button>
            <button
              @click="page++"
              :disabled="page >= totalPages"
              class="size-7 rounded hover:bg-muted flex items-center justify-center text-muted-foreground disabled:opacity-40"
            >
              <ChevronRight class="size-4" />
            </button>
            <button
              @click="page = totalPages"
              :disabled="page >= totalPages"
              class="size-7 rounded hover:bg-muted flex items-center justify-center text-muted-foreground disabled:opacity-40"
            >
              <ChevronsRight class="size-4" />
            </button>
          </div>
        </div>
        </template>
      </div>
    </div>

    <!-- Add New Team Member Invite Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showInvite"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="showInvite = false"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style="width: 90vw; max-width: 760px; max-height: 90vh"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-semibold">Add New Team Member</h3>
              <button
                @click="showInvite = false"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col">
              <p
                class="text-xs text-muted-foreground mb-5 max-w-xl leading-relaxed"
              >
                After the invitation is sent to their email, a code will be
                provided to the new user. They must log in and click "Accept
                Invite" to complete the registration process.
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Left: Details -->
                <div class="flex flex-col gap-3">
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1"
                  >
                    Team Member Details
                  </p>
                  <div class="grid grid-cols-2 gap-3">
                    <input
                      v-model="invite.firstName"
                      placeholder="First name"
                      class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                    <input
                      v-model="invite.lastName"
                      placeholder="Last name"
                      class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    v-model="invite.email"
                    type="email"
                    placeholder="Email"
                    class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                  <PhoneInput v-model="invite.phone" countryCode="EG" />
                  <SearchableSelect
                    v-model="invite.role"
                    :options="roleOptions"
                    placeholder="Select role..."
                  />
                </div>

                <!-- Right: Brand Access & Permissions -->
                <div class="flex flex-col gap-4">
                  <div>
                    <p
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
                    >
                      Brand Access
                    </p>
                    <div
                      class="rounded-xl border bg-white-10 overflow-hidden divide-y divide-border/50"
                    >
                      <label
                        v-for="b in localBrandsList"
                        :key="b.id"
                        class="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/10 cursor-pointer"
                      >
                        <AppCheckbox v-model="invite.brands[b.id]" />
                        <div
                          class="flex size-7 items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
                          :style="{ background: b.color }"
                        >
                          {{ b.init }}
                        </div>
                        <span class="text-xs font-semibold">{{ b.name }}</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <p
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
                    >
                      They'll Be Able To
                    </p>
                    <ul class="flex flex-col gap-2">
                      <li
                        v-for="p in permissions"
                        :key="p"
                        class="flex items-center gap-2 text-xs font-semibold"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span class="text-foreground/80">{{ p }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="flex items-center justify-end gap-2 px-5 py-4 border-t border-border shrink-0"
            >
              <button
                @click="showInvite = false"
                class="px-4 py-2 border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                @click="sendInvite"
                :disabled="!isInviteValid || sendingInvite"
                class="px-5 py-2 rounded-lg text-xs font-bold transition-all"
                :class="
                  !isInviteValid || sendingInvite
                    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    : 'bg-black hover:bg-black/90 text-white cursor-pointer shadow-sm'
                "
              >
                {{ sendingInvite ? "Sending..." : "Send Invite" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Member Profile Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedMember"
          class="fixed inset-0 z-[500] flex items-center justify-center"
          @click.self="selectedMember = null"
        >
          <div class="absolute inset-0 bg-white/35 backdrop-blur-sm" />
          <div
            class="relative bg-background rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
            style="width: 90vw; max-width: 760px; max-height: 90vh"
          >
            <div
              class="flex items-center justify-between px-5 py-4 border-b border-border shrink-0"
            >
              <h3 class="text-base font-semibold">Team Member Details</h3>
              <button
                @click="selectedMember = null"
                class="size-7 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground"
              >
                <X class="size-4" />
              </button>
            </div>
            <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col">
              <div class="flex items-center gap-4 mb-6">
                <img
                  v-if="selectedMember.avatar"
                  :src="selectedMember.avatar"
                  class="size-16 rounded-full object-cover border border-border"
                />
                <div
                  v-else
                  class="size-16 rounded-full bg-slate-800 text-white flex items-center justify-center text-lg font-bold"
                >
                  {{ selectedMember.name[0] }}
                </div>
                <div>
                  <h4 class="font-bold text-base text-foreground">
                    {{ selectedMember.name }}
                  </h4>
                  <p class="text-xs text-muted-foreground mt-0.5 capitalize">
                    {{ selectedMember.role }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Left: Details -->
                <div class="flex flex-col gap-3">
                  <p
                    class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1"
                  >
                    Details
                  </p>
                  <div class="grid grid-cols-2 gap-3">
                    <input
                      v-model="selectedMember.firstName"
                      placeholder="First name"
                      class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                    <input
                      v-model="selectedMember.lastName"
                      placeholder="Last name"
                      class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <input
                    v-model="selectedMember.email"
                    type="email"
                    class="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                  <PhoneInput v-model="selectedMember.phone" countryCode="EG" />
                  <SearchableSelect
                    v-model="selectedMember.roleCode"
                    :options="roleOptions"
                    placeholder="Role"
                  />
                </div>

                <!-- Right: Brand Access & Permissions -->
                <div class="flex flex-col gap-4">
                  <div>
                    <p
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
                    >
                      Brand Access
                    </p>
                    <div
                      class="rounded-xl border bg-white-10 overflow-hidden divide-y divide-border/50"
                    >
                      <label
                        v-for="b in localBrandsList"
                        :key="b.id"
                        class="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/10 cursor-pointer"
                      >
                        <AppCheckbox
                          v-model="selectedMember.brandAccess[b.id]"
                        />
                        <div
                          class="flex size-7 items-center justify-center rounded text-[10px] font-bold text-white shrink-0"
                          :style="{ background: b.color }"
                        >
                          {{ b.init }}
                        </div>
                        <span class="text-xs font-semibold">{{ b.name }}</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <p
                      class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2"
                    >
                      Permissions
                    </p>
                    <ul class="flex flex-col gap-2">
                      <li
                        v-for="p in permissions"
                        :key="p"
                        class="flex items-center gap-2 text-xs font-semibold"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#10b981"
                          stroke-width="3"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span class="text-foreground/80">{{ p }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-border shrink-0"
            >
              <button
                @click="removeMember"
                class="w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors order-3 sm:order-1"
              >
                Remove from team
              </button>
              <div class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                <button
                  @click="saveMemberChanges"
                  class="w-full sm:w-auto px-5 py-2 bg-black hover:bg-black/90 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Save Changes
                </button>
                <button
                  @click="selectedMember = null"
                  class="w-full sm:w-auto px-4 py-2 border border-border rounded-lg text-xs font-bold hover:bg-muted transition-colors order-last sm:order-first"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from "vue";
import {
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
  Plus,
} from "lucide-vue-next";
import { useAppStore } from "@/stores/app";
import { useBrandStore } from "@/stores/brand";
import { useApi } from "@/composables/useApi";
import SwitchToggle from "@/components/ui/SwitchToggle.vue";
import AppButton from "@/components/ui/AppButton.vue";
import PhoneInput from "@/components/ui/PhoneInput.vue";
import SearchableSelect from "@/components/ui/SearchableSelect.vue";
import AppCheckbox from "@/components/ui/AppCheckbox.vue";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton.vue";
import AppSelect from "@/components/ui/AppSelect.vue";

const { toast } = useAppStore();
const brandStore = useBrandStore();
const { get, post, patch, del } = useApi();

const activeTab = ref("users");
const showInvite = ref(false);
const selectedMember = ref(null);
const rowsPerPage = ref(10);
const page = ref(1);

const teamMembers = ref([]);
const loadingTeam = ref(false);
const activityLogs = ref([]);
const totalLogs = ref(0);
const loadingLogs = ref(false);

const localBrandsList = computed(() => {
  return brandStore.brands.map((b) => ({
    id: b.id,
    name: b.name,
    init: (b.name || "B").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
    color: b.color || "#4f46e5",
  }));
});

const roleOptions = [
  { value: "brand_admin", label: "Owner" },
  { value: "brand_manager", label: "Brand manager" },
  { value: "fulfillment", label: "Fulfillment & CS Executive" },
];

const permissions = [
  "Manage products & listings",
  "View orders",
  "Access analytics",
  "Manage inventory",
  "Contact support",
];

const invite = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  brands: {},
});

const sendingInvite = ref(false);

const isInviteValid = computed(() => {
  const fName = (invite.firstName || "").trim();
  const lName = (invite.lastName || "").trim();
  const email = (invite.email || "").trim();
  const role = (invite.role || "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    fName.length > 0 &&
    lName.length > 0 &&
    email.length > 0 &&
    emailRegex.test(email) &&
    role.length > 0
  );
});

watch(showInvite, (isOpen) => {
  if (isOpen) {
    Object.assign(invite, {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      brands: {},
    });
  }
});

const groups = computed(() => {
  const ownersList = teamMembers.value.filter((m) => m.group === "owners");
  const managersList = teamMembers.value.filter((m) => m.group === "brand_managers");
  const fulfillmentList = teamMembers.value.filter((m) => m.group === "fulfillment");
  
  return [
    { label: "Owners", members: ownersList },
    { label: "Brand Managers", members: managersList },
    { label: "Fulfillment and Customer Service Executives", members: fulfillmentList },
  ].filter((g) => g.members.length > 0);
});

const totalPages = computed(() => Math.ceil(totalLogs.value / rowsPerPage.value) || 1);
const startIndex = computed(() => (page.value - 1) * rowsPerPage.value + 1);
const endIndex = computed(() => Math.min(page.value * rowsPerPage.value, totalLogs.value));

async function fetchTeam() {
  loadingTeam.value = true;
  try {
    const res = await get("/supplier/team");
    const data = res?.data || res || [];
    
    if (Array.isArray(data)) {
      teamMembers.value = data.map((m) => {
        const name = m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email;
        let group = "fulfillment";
        const rCode = String(m.roleCode || m.role || "").toLowerCase();
        if (rCode.includes("owner")) group = "owners";
        else if (rCode.includes("manager")) group = "brand_managers";
        
        return {
          id: m.id,
          name,
          firstName: m.firstName || "",
          lastName: m.lastName || "",
          email: m.email || "",
          phone: m.phone || "",
          avatar: m.avatar || null,
          role: m.roleName || m.role || m.roleCode || "Fulfillment",
          roleCode: (m.roleCode || "fulfillment") === "owner" ? "brand_admin" : (m.roleCode || "fulfillment"),
          group,
          status: m.status || "Active",
          brands: Array.isArray(m.brands) ? m.brands.map((b) => b.name || b).join(", ") : (m.brands || ""),
          brandIds: Array.isArray(m.brands) ? m.brands.map((b) => b.id || b) : []
        };
      });
    } else if (data && typeof data === "object") {
      let list = [];
      if (Array.isArray(data.groups)) {
        data.groups.forEach((g) => {
          if (Array.isArray(g.members)) {
            g.members.forEach((m) => {
              const name = m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email;
              list.push({
                id: m.id,
                name,
                firstName: m.firstName || "",
                lastName: m.lastName || "",
                email: m.email || "",
                phone: m.phone || "",
                avatar: m.avatar || m.avatarUrl || null,
                role: m.role || m.roleName || m.roleCode || "Fulfillment",
                roleCode: (m.roleCode || "fulfillment") === "owner" ? "brand_admin" : (m.roleCode || "fulfillment"),
                group: g.key || "fulfillment",
                status: m.status || "Active",
                brands: Array.isArray(m.brands) ? m.brands.map((b) => b.name || b).join(", ") : (m.brands || ""),
                brandIds: Array.isArray(m.brands) ? m.brands.map((b) => b.id || b) : []
              });
            });
          }
        });
      } else {
        Object.keys(data).forEach((k) => {
          if (Array.isArray(data[k])) {
            const mapped = data[k].map((m) => {
              const name = m.name || `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email;
              return {
                id: m.id,
                name,
                firstName: m.firstName || "",
                lastName: m.lastName || "",
                email: m.email || "",
                phone: m.phone || "",
                avatar: m.avatar || m.avatarUrl || null,
                role: m.roleName || m.role || m.roleCode || "Fulfillment",
                roleCode: (m.roleCode || "fulfillment") === "owner" ? "brand_admin" : (m.roleCode || "fulfillment"),
                group: k,
                status: m.status || "Active",
                brands: Array.isArray(m.brands) ? m.brands.map((b) => b.name || b).join(", ") : (m.brands || ""),
                brandIds: Array.isArray(m.brands) ? m.brands.map((b) => b.id || b) : []
              };
            });
            list = list.concat(mapped);
          }
        });
      }
      teamMembers.value = list;
    }
  } catch (e) {
    console.error("Failed to fetch team:", e);
  } finally {
    loadingTeam.value = false;
  }
}

async function fetchActivityLogs() {
  loadingLogs.value = true;
  try {
    const res = await get("/supplier/team/activity", {
      page: page.value,
      per_page: rowsPerPage.value,
    });
    const items = res?.items || res?.data || [];
    activityLogs.value = items.map((log) => ({
      id: log.id,
      name: log.userName || log.name || log.user?.name || "System",
      action: log.action || log.description || "",
      ip: log.ipAddress || log.ip || "—",
      time: (log.occurredAt || log.createdAt) ? new Date(log.occurredAt || log.createdAt).toLocaleString() : "—",
    }));
    totalLogs.value = res?.meta?.total || res?.total || items.length;
  } catch (e) {
    console.error("Failed to fetch activity logs:", e);
  } finally {
    loadingLogs.value = false;
  }
}

onMounted(async () => {
  await Promise.allSettled([
    brandStore.fetchBrands(),
    fetchTeam(),
  ]);
});

watch(activeTab, (newTab) => {
  if (newTab === "log") {
    page.value = 1;
    fetchActivityLogs();
  }
});

watch([page, rowsPerPage], () => {
  if (activeTab.value === "log") {
    fetchActivityLogs();
  }
});

watch(
  () => brandStore.currentBrandId,
  async () => {
    await fetchTeam();
    if (activeTab.value === "log") {
      await fetchActivityLogs();
    }
  }
);

async function openMemberProfile(m) {
  // Initialize local details first to make the modal open instantly
  let fName = m.firstName || "";
  let lName = m.lastName || "";
  if ((!fName || !lName) && m.name) {
    const parts = m.name.trim().split(/\s+/);
    fName = parts[0] || "";
    lName = parts.slice(1).join(" ") || "";
  }

  const brandAccess = {};
  brandStore.brands.forEach((b) => {
    const hasAccess = m.brands?.includes(b.name) || m.brandIds?.includes(b.id);
    brandAccess[b.id] = !!hasAccess;
  });

  selectedMember.value = {
    ...m,
    firstName: fName,
    lastName: lName,
    brandAccess,
  };
}

async function sendInvite() {
  if (!isInviteValid.value || sendingInvite.value) return;
  sendingInvite.value = true;
  try {
    const brandIds = Object.keys(invite.brands).filter((id) => invite.brands[id]);
    await post("/supplier/team/members", {
      firstName: invite.firstName.trim(),
      lastName: invite.lastName.trim(),
      email: invite.email.trim(),
      phone: invite.phone,
      roleCode: invite.role,
      brandIds: brandIds,
    });
    toast("Invitation sent successfully!");
    showInvite.value = false;
    Object.assign(invite, {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      brands: {},
    });
    await fetchTeam();
  } catch (e) {
    console.error("Failed to send invite:", e);
  } finally {
    sendingInvite.value = false;
  }
}

async function saveMemberChanges() {
  const m = selectedMember.value;
  if (!m) return;
  try {
    const brandIds = Object.keys(m.brandAccess).filter((id) => m.brandAccess[id]);
    await patch(`/supplier/team/members/${m.id}`, {
      firstName: m.firstName,
      lastName: m.lastName,
      roleCode: m.roleCode,
      status: m.status,
      brandIds: brandIds,
    });
    toast("Member updated successfully!");
    selectedMember.value = null;
    await fetchTeam();
  } catch (e) {
    console.error(e);
  }
}

async function removeMember() {
  const m = selectedMember.value;
  if (!m) return;
  try {
    await del(`/supplier/team/${m.id}`);
    toast("Member removed from team!");
    selectedMember.value = null;
    await fetchTeam();
  } catch (e) {
    console.error(e);
  }
}
</script>

<style scoped>
.modal-enter-active {
  transition: all 200ms ease;
}
.modal-leave-active {
  transition: all 150ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
