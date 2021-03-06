import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PreferenceSet, Preference, Order } from '../../data-objects';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserOrderComponent } from './user-order/user-order.component';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent implements OnInit {

  preferences: PreferenceSet[] = [];
  errorLabel: String = "";
  modalPreferences: Preference[] = [];
  bsModalRef: BsModalRef;
  toppings: String[] = [];
  allergies: String[] = [];
  prefSetName: String = "";
  prefDisplay: Preference[] = [];
  flag: boolean = false;
  openModalID: number = -1;
  friends: String[] = [];
  myOrder: String[] = [];
  
  constructor(private router: Router, private http: HttpClient, private modalService: BsModalService) { }

  ngOnInit() {
    this.errorLabel = ""
    this.fetchPrefSets();
  }

  fetchPrefSets() {
    this.http.get<PreferenceSet[]>('http://localhost:8080/prefsets/' + this.router.url.split('/')[2])
      .subscribe((data: PreferenceSet[]) => this.preferences = data);
  }

  updateCurrent(id: number) {
    this.http.post('http://localhost:8080/current/' + this.router.url.split('/')[2] + '/' + id, "")
      .subscribe(x => this.fetchPrefSets());
  }

  deletePref(pref: PreferenceSet) {
    this.errorLabel = ""
    if (pref.isCurrent) {
      this.errorLabel = "You cannot delete your current preference set"
    } else {
      this.http.delete('http://localhost:8080/removePref/' + pref.id)
        .subscribe(x => this.fetchPrefSets());
    }
  }

  fetchToppings() {
    this.http.get<String[]>('http://localhost:8080/toppings')
      .subscribe((data: String[]) => {
        this.toppings = data;
      });
  }

  fetchAllergies() {
    this.http.get<String[]>('http://localhost:8080/allergies/' + this.router.url.split('/')[2])
      .subscribe((data: String[]) => {
        this.allergies = data;
      });
  }

  allergicTo(top: String): boolean {
    return (this.allergies.findIndex((allergy: String) => allergy === top)) !== -1;
  }

  openPref(currentPref?: Preference[], openID?: number, name?: String) {
    this.flag = false;
    if (name) {
      this.prefSetName = name;
    } else {
      this.prefSetName = "";
    }
    if (openID) {
      this.openModalID = openID;
    } else {
      this.openModalID = -1;
    }
    this.http.get<String[]>('http://localhost:8080/toppings')
      .subscribe((data: String[]) => {
        this.toppings = data;
        this.http.get<String[]>('http://localhost:8080/allergies/' + this.router.url.split('/')[2])
          .subscribe((data: String[]) => {
            this.allergies = data;
            let neededTops: String[] = this.toppings.filter((top: String) => !this.allergicTo(top));
            this.prefDisplay = [];
            if (currentPref) {
              for (let top of neededTops) {
                let index: number = currentPref.findIndex((pref: Preference) => pref.topping === top);
                if (index !== -1) {
                  this.prefDisplay.push({ topping: <string>top, score: currentPref[index].score });
                } else {
                  this.prefDisplay.push({ topping: <string>top, score: 0 });
                }
              }
            } else {
              this.flag = true;
              for (let top of neededTops) {
                this.prefDisplay.push({ topping: <string>top, score: 0 });
              }
            }
          });
      });
  }

  savePref(modal: BsModalRef) {
    if (this.prefSetName.length != 0) {
      if (this.flag) {
        this.http.post('http://localhost:8080/prefsNew/' + this.router.url.split('/')[2], { name: this.prefSetName, preferences: this.prefDisplay })
          .subscribe(x => this.fetchPrefSets());
      } else {
        this.http.post('http://localhost:8080/prefsUpdate/' + this.openModalID, { name: this.prefSetName, preferences: this.prefDisplay })
          .subscribe(x => this.fetchPrefSets());
      }
      modal.hide();
    }
  }

  pullFriends() {
    this.http.get<String[]>('http://localhost:8080/friends/' + this.router.url.split('/')[2])
      .subscribe((data: String[]) => {
        this.friends = data;
      });
  }
  addToOrder(friend: String) {
    if (this.myOrder.findIndex((orderMember: String) => orderMember === friend) === -1) {
      this.myOrder.push(friend);
    }
  }

  removeFromOrder(person: String) {
    this.myOrder = this.myOrder.filter((orderMember: String) => orderMember !== person);
  }

  placeOrder() {
    this.myOrder.push(this.router.url.split('/')[2]);
    this.http.post('http://localhost:8080/order', this.myOrder)
      .subscribe((o: Order) => {
        const initialState = { order: o };
        this.bsModalRef = this.modalService.show(UserOrderComponent, { initialState });
      });
    this.myOrder = [];
  }
}
